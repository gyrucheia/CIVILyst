<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
try {
    $send = in_array('--send', $argv, true);
    $key = trim((string) getenv('CIVILY_SEMAPHORE_API_KEY'));
    if ($send && ($key === '' || !extension_loaded('curl'))) {
        throw new RuntimeException('Sending requires a server-side Semaphore key and the PHP cURL extension.');
    }
    $db = new PDO('mysql:host=127.0.0.1;port=3306;dbname=civily_dev;charset=utf8mb4', 'civily_app', getenv('CIVILY_DB_PASSWORD'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
    $rows = $db->query("SELECT sms_id, recipient_mobile, message_body FROM sms_notifications
        WHERE provider_code = 'semaphore' AND delivery_status = 'queued' AND message_body IS NOT NULL ORDER BY sms_id LIMIT 20")->fetchAll();
    if (!$send) {
        echo count($rows) . " queued notices ready for this batch. No SMS sent.\n";
        exit;
    }
    $claim = $db->prepare("UPDATE sms_notifications SET delivery_status = 'submitting', status_updated_at = CURRENT_TIMESTAMP
        WHERE sms_id = ? AND delivery_status = 'queued'");
    $finish = $db->prepare("UPDATE sms_notifications SET provider_message_id = ?, delivery_status = ?,
        sent_at = CASE WHEN ? IS NOT NULL THEN CURRENT_TIMESTAMP ELSE NULL END, status_updated_at = CURRENT_TIMESTAMP WHERE sms_id = ?");
    foreach ($rows as $row) {
        $claim->execute([$row['sms_id']]);
        if ($claim->rowCount() !== 1) continue;
        $request = ['apikey' => $key, 'number' => ltrim($row['recipient_mobile'], '+'), 'message' => $row['message_body']];
        $sender = trim((string) getenv('CIVILY_SEMAPHORE_SENDER'));
        if ($sender !== '') $request['sendername'] = $sender;
        $handle = curl_init('https://api.semaphore.co/api/v4/messages');
        curl_setopt_array($handle, [
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => http_build_query($request),
            CURLOPT_HTTPHEADER => ['Content-Type: application/x-www-form-urlencoded'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => 15,
        ]);
        $response = curl_exec($handle);
        $code = curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $data = is_string($response) ? json_decode($response, true) : null;
        $id = $code >= 200 && $code < 300 && is_array($data) && is_numeric($data[0]['message_id'] ?? null)
            ? (string) $data[0]['message_id'] : null;
        $status = $id !== null ? match (strtolower((string) ($data[0]['status'] ?? ''))) {
            'sent' => 'sent_to_network',
            'failed', 'refunded' => 'provider_failed',
            default => 'submitted',
        } : 'needs_review';
        // A timeout may occur after provider acceptance. Review that attempt before retrying.
        $finish->execute([$id, $status, $id, $row['sms_id']]);
        echo "Notice {$row['sms_id']}: $status\n";
        if ($id === null) break;
    }
} catch (PDOException) {
    fwrite(STDERR, "SMS queue database operation failed.\n");
    exit(1);
} catch (RuntimeException $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
}
