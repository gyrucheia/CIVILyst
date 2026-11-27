<?php
declare(strict_types=1);

ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function reply(mixed $data, int $status = 200): never {
    http_response_code($status);
    echo json_encode($data, JSON_THROW_ON_ERROR);
    exit;
}

function required(array $input, string $key, int $max = 100): string {
    $value = $input[$key] ?? null;
    if (!is_string($value) || trim($value) === '' || mb_strlen(trim($value)) > $max) {
        reply(['error' => "Check the $key field."], 422);
    }
    return trim($value);
}

function dateValue(array $input, string $key): string {
    $value = required($input, $key, 10);
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    if (!$date || $date->format('Y-m-d') !== $value) {
        reply(['error' => "Enter a valid $key."], 422);
    }
    return $value;
}

function query(PDO $db, string $sql, array $args = []): PDOStatement {
    $statement = $db->prepare($sql);
    $statement->execute($args);
    return $statement;
}

function audit(PDO $db, int $actor, string $action, ?int $petition = null, ?int $target = null, array $details = []): void {
    query($db, 'INSERT INTO audit_events (actor_staff_id, action, petition_id, target_staff_id, change_details) VALUES (?, ?, ?, ?, ?)',
        [$actor, $action, $petition, $target, json_encode($details, JSON_THROW_ON_ERROR)]);
}

function queueSms(PDO $db, int $actor, int $petitionId, string $mobile, string $reference, string $stage, ?int $milestoneId = null): void {
    $stageLabel = preg_replace('/[^ -~]/', '', $stage);
    $referenceLabel = preg_replace('/[^A-Z0-9-]/', '', strtoupper($reference));
    $message = 'CIVILyst: Petition ' . $referenceLabel . ' is now at ' . substr($stageLabel, 0, 55) . '. Check CIVILyst for details.';
    query($db, "INSERT INTO sms_notifications (petition_id, milestone_id, recipient_mobile, provider_code, message_body) VALUES (?, ?, ?, 'semaphore', ?)",
        [$petitionId, $milestoneId, $mobile, $message]);
    audit($db, $actor, 'sms_notice_queued', $petitionId, null, ['milestone_id' => $milestoneId]);
}

function accountFields(array $input): array {
    $name = required($input, 'name', 160);
    $email = strtolower(required($input, 'email', 254));
    $password = $input['password'] ?? null;
    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || strlen($password) < 12 || strlen($password) > 72) {
        reply(['error' => 'Use a valid email and a password of 12 to 72 bytes.'], 422);
    }
    return [$name, $email, password_hash($password, PASSWORD_DEFAULT)];
}

try {
    session_name('civily_session');
    ini_set('session.use_strict_mode', '1');
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Strict', 'path' => '/api']);
    $sessionDir = sys_get_temp_dir() . DIRECTORY_SEPARATOR . 'civily-staff-sessions';
    if (!is_dir($sessionDir) && !mkdir($sessionDir, 0700, true) && !is_dir($sessionDir)) {
        reply(['error' => 'The local session directory is unavailable.'], 503);
    }
    session_save_path($sessionDir);
    if (!session_start()) reply(['error' => 'The local session could not start.'], 503);

    $password = getenv('CIVILY_DB_PASSWORD');
    if ($password === false || $password === '') {
        reply(['error' => 'The local API database connection is not configured.'], 503);
    }
    $port = (int) (getenv('CIVILY_DB_PORT') ?: 3306);
    $db = new PDO("mysql:host=127.0.0.1;port=$port;dbname=civily_dev;charset=utf8mb4", 'civily_app', $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $method = $_SERVER['REQUEST_METHOD'];
    $input = [];
    if ($method === 'POST') {
        if (strtolower(trim(explode(';', $_SERVER['CONTENT_TYPE'] ?? '')[0])) !== 'application/json') {
            reply(['error' => 'Send JSON.'], 415);
        }
        $raw = file_get_contents('php://input', false, null, 0, 16385);
        if (!$raw || strlen($raw) > 16384) reply(['error' => 'Invalid request size.'], 400);
        $input = json_decode($raw, true);
        if (!is_array($input)) reply(['error' => 'Invalid JSON.'], 400);
    }
    $staff = isset($_SESSION['staff_id'])
        ? query($db, 'SELECT staff_id, full_name, email, role FROM staff_accounts WHERE staff_id = ? AND is_active = TRUE', [$_SESSION['staff_id']])->fetch()
        : false;

    if ($method === 'GET' && $path === '/api/session') {
        reply(['staff' => $staff ?: null]);
    }
    if ($method === 'POST' && $path === '/api/login') {
        $email = strtolower(required($input, 'email', 254));
        $secret = $input['password'] ?? '';
        $account = query($db, 'SELECT staff_id, password_hash FROM staff_accounts WHERE email = ? AND is_active = TRUE', [$email])->fetch();
        if (!is_string($secret) || !$account || !password_verify($secret, $account['password_hash'])) {
            reply(['error' => 'The email or password is incorrect.'], 401);
        }
        audit($db, (int) $account['staff_id'], 'signed_in');
        session_regenerate_id(true);
        $_SESSION['staff_id'] = (int) $account['staff_id'];
        reply(['ok' => true]);
    }
    if ($method === 'POST' && $path === '/api/track') {
        $reference = strtoupper(required($input, 'reference', 40));
        $petition = query($db, 'SELECT p.petition_id, p.transaction_ref_no, p.filing_date FROM petitions p WHERE p.transaction_ref_no = ?', [$reference])->fetch();
        if (!$petition) reply(['error' => 'No petition matched that transaction reference.'], 404);
        $milestones = query($db, 'SELECT stage_code, effective_on, public_remark, changes_current_stage FROM petition_milestones WHERE petition_id = ? ORDER BY recorded_at, milestone_id', [$petition['petition_id']])->fetchAll();
        unset($petition['petition_id']);
        reply(['petition' => $petition, 'milestones' => $milestones]);
    }

    if (!$staff) reply(['error' => 'Sign in to continue.'], 401);
    $actor = (int) $staff['staff_id'];
    if ($method === 'POST' && $path === '/api/logout') {
        audit($db, $actor, 'signed_out');
        $_SESSION = [];
        session_destroy();
        setcookie(session_name(), '', ['expires' => 1, 'path' => '/api', 'httponly' => true, 'samesite' => 'Strict']);
        reply(['ok' => true]);
    }

    $types = [
        'clerical' => ['Correction of Clerical or Typographical Error', 'RA 9048'],
        'first-name' => ['Change of First Name', 'RA 9048'],
        'birth-date' => ['Correction of Date of Birth', 'RA 10172'],
        'sex' => ['Correction of Sex', 'RA 10172'],
    ];
    if ($method === 'GET' && $path === '/api/petition-types') reply($types);
    if ($method === 'POST' && $path === '/api/petitions') {
        $cce = required($input, 'CCE number', 40);
        $date = dateValue($input, 'filing date');
        $dob = dateValue($input, 'owner date of birth');
        $type = required($input, 'type', 40);
        if (!isset($types[$type])) reply(['error' => 'Choose a valid petition type.'], 422);
        $petitioner = [required($input, 'petitioner first name'), required($input, 'petitioner last name')];
        $owner = [required($input, 'owner first name'), required($input, 'owner last name'), $dob];
        $relationship = required($input, 'relationship', 80);
        $box = required($input, 'box', 60);
        $mobile = null;
        if (($input['contact number'] ?? '') !== '') {
            $mobile = required($input, 'contact number', 24);
            $mobile = preg_replace('/[\s()-]+/', '', $mobile);
            if (preg_match('/^09\d{9}$/', $mobile)) $mobile = '+63' . substr($mobile, 1);
            if (!preg_match('/^\+639\d{9}$/', $mobile)) {
                reply(['error' => 'Enter a Philippine mobile number starting with 09 or +639.'], 422);
            }
        }
        $reference = sprintf('CCE-%012d-%s', random_int(0, 999999999999), substr($date, 0, 4));
        $db->beginTransaction();
        query($db, 'INSERT INTO petition_types (type_code, type_name, legal_basis) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE type_code = VALUES(type_code)', [$type, ...$types[$type]]);
        $typeId = query($db, 'SELECT petition_type_id FROM petition_types WHERE type_code = ?', [$type])->fetchColumn();
        query($db, 'INSERT INTO petitioners (first_name, last_name, contact_number) VALUES (?, ?, ?)', [...$petitioner, $mobile]);
        $petitionerId = $db->lastInsertId();
        query($db, 'INSERT INTO document_owners (first_name, last_name, date_of_birth) VALUES (?, ?, ?)', $owner);
        $ownerId = $db->lastInsertId();
        query($db, 'INSERT INTO petitions (transaction_ref_no, cce_number, petitioner_id, document_owner_id, relationship_to_owner, petition_type_id, physical_box_number, filing_date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [$reference, $cce, $petitionerId, $ownerId, $relationship, $typeId, $box, $date, $actor]);
        $petitionId = (int) $db->lastInsertId();
        query($db, "INSERT INTO petition_milestones (petition_id, stage_code, stage_status, effective_on, changes_current_stage, recorded_by) VALUES (?, 'Petition Accepted', 'recorded', ?, TRUE, ?)", [$petitionId, $date, $actor]);
        audit($db, $actor, 'petition_encoded', $petitionId);
        if ($mobile !== null) {
            queueSms($db, $actor, $petitionId, $mobile, $reference, 'Petition Accepted');
        }
        $db->commit();
        reply(['reference' => $reference, 'smsQueued' => $mobile !== null], 201);
    }
    if ($staff['role'] !== 'super_admin') reply(['error' => 'Super Admin access is required.'], 403);
    if ($method === 'GET' && $path === '/api/petitions') {
        reply(query($db, "SELECT p.petition_id, p.transaction_ref_no, p.cce_number, p.filing_date, p.updated_at, p.physical_box_number, t.type_name,
            CONCAT(a.first_name, ' ', a.last_name) AS petitioner, CONCAT(o.first_name, ' ', o.last_name) AS document_owner,
            (SELECT stage_code FROM petition_milestones m WHERE m.petition_id = p.petition_id AND changes_current_stage = TRUE ORDER BY recorded_at DESC, milestone_id DESC LIMIT 1) AS current_stage
            FROM petitions p JOIN petition_types t USING (petition_type_id) JOIN petitioners a USING (petitioner_id)
            JOIN document_owners o USING (document_owner_id) ORDER BY p.petition_id DESC")->fetchAll());
    }
    if ($method === 'POST' && $path === '/api/milestones') {
        $id = filter_var($input['petition_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
        if (!$id) reply(['error' => 'Petition not found.'], 404);
        $stage = required($input, 'stage');
        $date = dateValue($input, 'effective date');
        $current = ($input['current'] ?? false) === true;
        $public = isset($input['public remark']) && $input['public remark'] !== '' ? required($input, 'public remark', 2000) : null;
        $db->beginTransaction();
        $petition = query($db, 'SELECT p.transaction_ref_no, a.contact_number FROM petitions p JOIN petitioners a USING (petitioner_id) WHERE p.petition_id = ? FOR UPDATE', [$id])->fetch();
        if (!$petition) {
            $db->rollBack();
            reply(['error' => 'Petition not found.'], 404);
        }
        $previousStage = query($db, 'SELECT stage_code FROM petition_milestones WHERE petition_id = ? AND changes_current_stage = TRUE ORDER BY recorded_at DESC, milestone_id DESC LIMIT 1', [$id])->fetchColumn();
        query($db, "INSERT INTO petition_milestones (petition_id, stage_code, stage_status, effective_on, changes_current_stage, public_remark, recorded_by) VALUES (?, ?, 'recorded', ?, ?, ?, ?)", [$id, $stage, $date, (int) $current, $public, $actor]);
        $milestoneId = (int) $db->lastInsertId();
        audit($db, $actor, 'milestone_recorded', $id, null, ['stage' => $stage, 'effective_on' => $date, 'changes_current_stage' => $current]);
        $queued = $current && $stage !== $previousStage && !empty($petition['contact_number']);
        if ($queued) queueSms($db, $actor, $id, $petition['contact_number'], $petition['transaction_ref_no'], $stage, $milestoneId);
        $db->commit();
        reply(['ok' => true, 'smsQueued' => $queued], 201);
    }
    if ($method === 'GET' && $path === '/api/accounts') {
        reply(query($db, 'SELECT staff_id, full_name, email, role, is_active FROM staff_accounts ORDER BY full_name')->fetchAll());
    }
    if ($method === 'POST' && $path === '/api/accounts') {
        $values = accountFields($input);
        $db->beginTransaction();
        query($db, "INSERT INTO staff_accounts (full_name, email, password_hash, role) VALUES (?, ?, ?, 'personnel')", $values);
        audit($db, $actor, 'personnel_created', null, (int) $db->lastInsertId());
        $db->commit();
        reply(['ok' => true], 201);
    }
    if ($method === 'GET' && $path === '/api/sms') {
        reply(query($db, "SELECT n.sms_id, p.cce_number, p.transaction_ref_no, CONCAT('•••• ', RIGHT(n.recipient_mobile, 4)) AS recipient, n.delivery_status, n.created_at, n.sent_at
            FROM sms_notifications n JOIN petitions p USING (petition_id) ORDER BY n.sms_id DESC LIMIT 200")->fetchAll());
    }
    if ($method === 'GET' && $path === '/api/audit') {
        reply(query($db, 'SELECT e.audit_event_id, e.action, e.recorded_at, a.full_name AS actor, a.email AS actor_email, a.role AS actor_role, p.cce_number, t.email AS target_email FROM audit_events e JOIN staff_accounts a ON a.staff_id = e.actor_staff_id LEFT JOIN petitions p ON p.petition_id = e.petition_id LEFT JOIN staff_accounts t ON t.staff_id = e.target_staff_id ORDER BY e.audit_event_id DESC LIMIT 200')->fetchAll());
    }
    reply(['error' => 'Route not found.'], 404);
} catch (PDOException $error) {
    if (isset($db) && $db->inTransaction()) $db->rollBack();
    if (($error->errorInfo[1] ?? null) === 1062) reply(['error' => 'A record already uses that identifier.'], 409);
    error_log('CIVILyst database error: ' . $error->getCode());
    reply(['error' => 'The local database operation failed.'], 503);
} catch (Throwable $error) {
    error_log('CIVILyst API error: ' . get_class($error));
    reply(['error' => 'The API could not complete the request.'], 500);
}
