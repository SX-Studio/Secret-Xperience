-- Controlekamer SMS-OTP second factor.
-- After a phone approves a desktop session, an OTP is texted to the admin's number;
-- the grant is only minted once that code is verified. These flags track that gate.
-- Safe/idempotent: nullable-with-default booleans on the existing table.

alter table public.control_room_sessions
  add column if not exists otp_required boolean not null default false,
  add column if not exists otp_verified boolean not null default false;
