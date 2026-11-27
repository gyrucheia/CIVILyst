<?php
declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}
try {
    $input = json_decode(stream_get_contents(STDIN), true, 16, JSON_THROW_ON_ERROR);
    $name = trim($input['name'] ?? '');
    $email = strtolower(trim($input['email'] ?? ''));
    $password = $input['password'] ?? '';
    if ($name === '' || mb_strlen($name) > 160 || strlen($email) > 254 ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 12 || strlen($password) > 72) {
        throw new InvalidArgumentException('Enter a name, valid email, and a password of 12 to 72 bytes.');
    }
    $db = new PDO('mysql:host=127.0.0.1;port=3306;dbname=civily_dev;charset=utf8mb4', 'civily_app', getenv('CIVILY_DB_PASSWORD'), [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
    ]);
    if ((int) $db->query("SELECT GET_LOCK('civily_first_account', 5)")->fetchColumn() !== 1) {
        throw new RuntimeException('Another setup is in progress.');
    }
    if ($db->query("SELECT 1 FROM staff_accounts WHERE role = 'super_admin' LIMIT 1")->fetchColumn()) {
        throw new RuntimeException('A Super Admin already exists.');
    }
    $db->beginTransaction();
    $db->prepare("INSERT INTO staff_accounts (full_name, email, password_hash, role) VALUES (?, ?, ?, 'super_admin')")
        ->execute([$name, $email, password_hash($password, PASSWORD_DEFAULT)]);
    $id = $db->lastInsertId();
    $db->prepare("INSERT INTO audit_events (actor_staff_id, target_staff_id, action) VALUES (?, ?, 'super_admin_created')")
        ->execute([$id, $id]);
    $db->commit();
    echo "Super Admin created. Sign in at http://127.0.0.1:5173/portal\n";
} catch (PDOException) {
    fwrite(STDERR, "Database setup failed. Verify the local service and account details.\n");
    exit(1);
} catch (InvalidArgumentException | RuntimeException $error) {
    fwrite(STDERR, $error->getMessage() . "\n");
    exit(1);
} catch (Throwable) {
    fwrite(STDERR, "Invalid setup input.\n");
    exit(1);
}
