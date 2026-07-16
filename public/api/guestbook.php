<?php
/**
 * Ocean Odyssey v1.0.0
 * Designed by Colin Dixon + Grok
 * 2026-07-16 10:32:00 AEST (Melbourne)
 * Website by https://oze.au
 *
 * Guestbook API for Hostinger (PHP).
 * POST JSON: { name, location?, email?, message }
 * Writes pending entries to ../data/guestbook-pending.json
 * Approved entries can be merged into guestbook.json for static display.
 */
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// CORS not needed same-origin; allow simple POSTs
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(204);
  exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);
if (!is_array($data)) {
  // also accept form-encoded
  $data = $_POST;
}

$name = trim((string)($data['name'] ?? ''));
$location = trim((string)($data['location'] ?? ''));
$email = trim((string)($data['email'] ?? ''));
$message = trim((string)($data['message'] ?? ''));
$honeypot = trim((string)($data['website'] ?? ''));

if ($honeypot !== '') {
  // silent success for bots
  echo json_encode(['ok' => true]);
  exit;
}

if ($name === '' || $message === '') {
  http_response_code(400);
  echo json_encode(['error' => 'Name and message are required']);
  exit;
}

if (mb_strlen($name) > 80 || mb_strlen($message) > 2000 || mb_strlen($location) > 80) {
  http_response_code(400);
  echo json_encode(['error' => 'Field too long']);
  exit;
}

// basic sanitisation for storage
$entry = [
  'id' => 'g-' . bin2hex(random_bytes(8)),
  'name' => $name,
  'location' => $location,
  'email' => $email,
  'message' => $message,
  'date' => gmdate('Y-m-d'),
  'created_at' => gmdate('c'),
  'approved' => false,
  'ip' => $_SERVER['REMOTE_ADDR'] ?? '',
];

$dir = __DIR__ . '/../data';
if (!is_dir($dir)) {
  @mkdir($dir, 0755, true);
}

$file = $dir . '/guestbook-pending.json';
$existing = [];
if (is_file($file)) {
  $decoded = json_decode((string)file_get_contents($file), true);
  if (is_array($decoded)) {
    $existing = $decoded;
  }
}
$existing[] = $entry;

if (file_put_contents($file, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE), LOCK_EX) === false) {
  http_response_code(500);
  echo json_encode(['error' => 'Could not save message']);
  exit;
}

// Optional: notify by mail if server allows
$notify = 'info@oceanodyssey.net';
@mail(
  $notify,
  'Ocean Odyssey guestbook: ' . $name,
  "New guestbook message (pending moderation)\n\nName: $name\nLocation: $location\nEmail: $email\n\n$message\n",
  "From: noreply@oceanodyssey.net\r\nReply-To: " . ($email !== '' ? $email : $notify)
);

echo json_encode(['ok' => true, 'id' => $entry['id']]);
