<?php
/**
 * Porta d'ingresso per Aura, l'assistente di Cerini IA (CT 110).
 *
 * - Accesso solo con la chiave segreta (header X-Aura-Key) e solo dagli IP consentiti.
 * - Elenco chiuso di azioni: riusa le API esistenti della Homebase, con la stessa logica e gli stessi permessi,
 *   agendo come l'utente configurato. Niente terminale, niente eliminazioni, niente credenziali dei servizi.
 * - Nessuna sessione resta aperta: la sessione serve solo per questa richiesta e viene distrutta alla fine.
 * - Ogni azione viene registrata in admin_audit_logs (azione "aura_<nome>").
 *
 * Configurazione: /etc/homebase/aura.json  {"key_sha256": "...", "user_id": 2, "allow_ips": ["IP-DEL-SERVER-DI-AURA"]}
 */

ini_set('session.use_cookies', '0');   // nessun cookie di sessione verso il chiamante
header('Cache-Control: no-store');

function auraFail($code, $msg) {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

$cfgFile = '/etc/homebase/aura.json';
$cfg = is_readable($cfgFile) ? json_decode((string)file_get_contents($cfgFile), true) : null;
if (!is_array($cfg) || empty($cfg['key_sha256']) || empty($cfg['user_id'])) {
    auraFail(503, 'Accesso per Aura non configurato');
}
if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', (array)($cfg['allow_ips'] ?? []), true)) {
    auraFail(403, 'Accesso non consentito da questo indirizzo');
}
$key = (string)($_SERVER['HTTP_X_AURA_KEY'] ?? '');
if ($key === '' || !hash_equals((string)$cfg['key_sha256'], hash('sha256', $key))) {
    auraFail(401, 'Chiave non valida');
}

// nome => [file dell'API, azione, metodi ammessi]
$OPS = [
    // Note e scratchpad: leggere, creare, modificare (non eliminare)
    'notes_list'          => ['notes.php', 'list', ['GET']],
    'notes_get'           => ['notes.php', 'get', ['GET']],
    'notes_create'        => ['notes.php', 'create', ['POST']],
    'notes_update'        => ['notes.php', 'update', ['POST']],
    'notes_pin'           => ['notes.php', 'toggle_pin', ['POST']],
    'scratch_get'         => ['scratchpad.php', 'get', ['GET']],
    'scratch_load'        => ['scratchpad.php', 'load', ['GET']],
    'scratch_save'        => ['scratchpad.php', 'save', ['POST']],
    'scratch_sheet_create'=> ['scratchpad.php', 'sheet_create', ['POST']],
    // Servizi e sezioni (mai le credenziali)
    'servizi_list'        => ['servizi.php', 'list', ['GET']],
    'servizi_create'      => ['servizi.php', 'create', ['POST']],
    'servizi_update'      => ['servizi.php', 'update', ['POST']],
    'sezioni_list'        => ['sezioni.php', 'list', ['GET']],
    // Ricerca globale
    'search'              => ['search.php', null, ['GET']],
    // Procedure e runbook: template per l'IA, controllo e importazione (niente eliminazioni)
    'proc_template'       => ['procedure.php', 'download_template', ['GET']],
    'proc_list'           => ['procedure.php', 'list', ['GET']],
    'proc_get'            => ['procedure.php', 'get', ['GET']],
    'proc_inspect'        => ['procedure.php', 'import_inspect', ['POST']],
    'proc_import'         => ['procedure.php', 'import', ['POST']],
    // Rete
    'net_overview'        => ['network_command_center.php', 'get_overview', ['GET', 'POST']],
    'net_devices'         => ['network_command_center.php', 'list_devices', ['GET', 'POST']],
    'net_device'          => ['network_command_center.php', 'get_device', ['GET', 'POST']],
    'net_dossier'         => ['network_command_center.php', 'get_device_dossier', ['GET', 'POST']],
    'net_alerts'          => ['network_command_center.php', 'get_alerts', ['GET', 'POST']],
    'net_alert_read'      => ['network_command_center.php', 'mark_alert_read', ['POST']],
    'net_topology'        => ['network_command_center.php', 'get_topology', ['GET', 'POST']],
    'net_scan'            => ['network_command_center.php', 'start_scan', ['POST']],
    'net_scan_progress'   => ['network_command_center.php', 'get_scan_progress', ['GET', 'POST']],
    'net_diagnostics'     => ['network_command_center.php', 'run_diagnostics', ['GET', 'POST']],
    'net_latencies'       => ['network_command_center.php', 'refresh_latencies', ['POST']],
    // Strumenti
    'dns'                 => ['dns_inspector.php', null, ['GET']],
    'pdf_scan'            => ['pdf_sentinel.php', 'scan', ['POST']],
    'pdf_get'             => ['pdf_sentinel.php', 'get', ['GET']],
    'pdf_history'         => ['pdf_sentinel.php', 'history', ['GET']],
    'secret_create'       => ['secret_share.php', 'create', ['POST']],
    'tts_voices'          => ['tts.php', 'voices', ['GET']],
    'tts_generate'        => ['tts.php', 'generate', ['POST']],
];

$op = (string)($_GET['op'] ?? '');
if (!isset($OPS[$op])) {
    auraFail(404, 'Azione non consentita');
}
[$apiFile, $apiAction, $methods] = $OPS[$op];
if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', $methods, true)) {
    auraFail(405, 'Metodo non consentito per questa azione');
}

require_once dirname(__DIR__) . '/pages/config.php';

try {
    $pdo = getDBConnection();
    $st = $pdo->prepare("SELECT id, username, nome, cognome, email, ruolo, session_version, cambio_password_obbligatorio
                         FROM utenti WHERE id = ? AND attivo = 1 AND stato = 'approvata'");
    $st->execute([(int)$cfg['user_id']]);
    $u = $st->fetch();
} catch (Throwable $e) {
    auraFail(500, 'Database non raggiungibile');
}
if (!$u) {
    auraFail(403, 'Utente per Aura non attivo');
}

// Sessione solo per questa richiesta (le API esistenti leggono l'utente da qui)
$_SESSION = [
    'user_id' => (int)$u['id'], 'ruolo' => $u['ruolo'], 'username' => $u['username'], 'nome' => $u['nome'],
    'cognome' => $u['cognome'], 'email' => $u['email'], 'session_version' => (int)($u['session_version'] ?? 1),
    'cambio_password_obbligatorio' => 0, 'last_activity_update' => time(),
    'csrf_token' => bin2hex(random_bytes(32)), 'aura_gateway' => 1,
];
$_SERVER['HTTP_X_CSRF_TOKEN'] = $_SESSION['csrf_token'];
// Alla fine la sessione sparisce: anche se un'API l'ha gia' chiusa (session_write_close), se ne cancella il file
$auraSid = session_id();
$auraDir = rtrim((string)session_save_path(), '/') ?: sys_get_temp_dir();
register_shutdown_function(function () use ($auraSid, $auraDir) {
    if (session_status() === PHP_SESSION_ACTIVE) {
        $_SESSION = [];
        @session_destroy();
    }
    if ($auraSid !== '' && preg_match('/^[a-zA-Z0-9,-]+$/', $auraSid)) {
        @unlink($auraDir . '/sess_' . $auraSid);
    }
});

// Campi che Aura non puo' mai mandare
foreach (['auth_user', 'auth_pass', 'clear_credentials', 'include_credentials', 'csrf_token'] as $k) {
    unset($_POST[$k], $_GET[$k], $_REQUEST[$k]);
}
unset($_GET['op']);
if ($apiAction !== null) {
    $_GET['action'] = $apiAction;
    $_REQUEST['action'] = $apiAction;
    if (isset($_POST['action'])) {
        $_POST['action'] = $apiAction;
    }
}

try {
    logAdminAction($pdo, 'aura_' . $op, 'aura', null, substr(json_encode(array_merge($_GET, $_POST), JSON_UNESCAPED_UNICODE), 0, 500));
} catch (Throwable $e) {}

// Le risposte JSON vengono ripulite da qualsiasi credenziale prima di uscire
function auraScrub(&$data) {
    if (!is_array($data)) {
        return;
    }
    foreach ($data as $k => &$v) {
        if (is_string($k) && preg_match('/^(auth_user|auth_pass|password|password_hash|pass|passwd|credentials?|remember_token|token_hash|csrf_token)$/i', $k)) {
            unset($data[$k]);
            continue;
        }
        if (is_array($v)) {
            auraScrub($v);
        }
    }
}
ob_start(function ($out) {
    $d = json_decode($out, true);
    if (!is_array($d)) {
        return $out;
    }
    auraScrub($d);
    return json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
});

require __DIR__ . '/' . $apiFile;
