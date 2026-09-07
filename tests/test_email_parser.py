from pathlib import Path


def test_parse_email_bytes_to_activity_event():
    from skillforge_local.email_parser import parse_email_bytes

    raw = Path("tests/fixtures/acme_request.eml").read_bytes()

    event = parse_email_bytes(raw, actor="fde_engineer", object_ref="imap://INBOX/1")

    assert event["type"] == "email_received"
    assert event["source"] == "email"
    assert event["payload"]["message_id"] == "msg_acme_001@example.com"
    assert event["payload"]["from"] == "maya@acme.example"
    assert event["payload"]["subject"] == "API onboarding request for Acme"
    assert "credentials" in event["payload"]["content_summary"]
