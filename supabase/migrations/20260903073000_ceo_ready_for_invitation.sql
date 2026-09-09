-- CEO approval is the sole business approval. It makes a request ready for
-- invitation without fabricating a technical approval.

alter table public.user_provisioning_requests
  drop constraint user_provisioning_requests_technical_approval_status_check;

alter table public.user_provisioning_requests
  add constraint user_provisioning_requests_technical_approval_status_check
  check (technical_approval_status in ('pending', 'approved', 'rejected', 'not_required'));

alter table public.user_provisioning_requests
  drop constraint user_provisioning_requests_check;

alter table public.user_provisioning_requests
  add constraint user_provisioning_requests_check
  check (
    (status = 'PENDING' and ceo_approval_status = 'pending' and technical_approval_status = 'pending' and invitation_status = 'not_sent' and auth_user_id is null)
    or (status = 'CEO_APPROVED' and ceo_approval_status = 'approved' and technical_approval_status = 'pending' and invitation_status = 'not_sent' and auth_user_id is null)
    or (status = 'READY_FOR_INVITATION' and ceo_approval_status = 'approved' and technical_approval_status in ('approved', 'not_required') and invitation_status = 'not_sent' and auth_user_id is null)
    or (status = 'INVITATION_SENT' and ceo_approval_status = 'approved' and technical_approval_status in ('approved', 'not_required') and invitation_status = 'sent' and auth_user_id is not null)
    or (status = 'ACCOUNT_ACTIVATED' and ceo_approval_status = 'approved' and technical_approval_status in ('approved', 'not_required') and invitation_status = 'accepted' and auth_user_id is not null)
    or (status = 'CEO_REJECTED' and ceo_approval_status = 'rejected' and technical_approval_status = 'pending' and invitation_status = 'not_sent' and auth_user_id is null)
    or (status = 'TECHNICAL_REJECTED' and ceo_approval_status = 'approved' and technical_approval_status = 'rejected' and invitation_status = 'not_sent' and auth_user_id is null)
    or (status = 'CANCELLED' and invitation_status = 'not_sent' and auth_user_id is null)
    or (status = 'DISABLED' and invitation_status = 'accepted' and auth_user_id is not null)
  );
