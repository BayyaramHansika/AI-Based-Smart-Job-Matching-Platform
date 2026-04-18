# Security Specification - TalentFlow AI

## Data Invariants
1. A user profile can only be modified by the owner.
2. Only users with the 'recruiter' role can create job listings.
3. Only users with the 'seeker' role can submit job applications.
4. Applications must reference a valid job ID and the current user's ID.
5. All documents must have `createdAt` and `updatedAt` timestamps validated against `request.time`.

## The "Dirty Dozen" (Attack Payloads)
1. **Identity Spoofing**: `POST /users/attacker-uid { uid: 'victim-uid' }` - Attempting to overwrite a victim's profile.
2. **Role Escalation**: `PATCH /users/seeker-uid { role: 'recruiter' }` - Attempting to change own role to gain recruiter privileges.
3. **Ghost Job**: `POST /jobs/random-id { company: 'Fake Corp', recruiterId: 'victim-uid' }` - Posting a job on behalf of someone else.
4. **Invalid State Skip**: `PATCH /applications/app-id { status: 'accepted' }` - A seeker trying to accept their own application.
5. **Orphaned Application**: `POST /applications/app-id { jobId: 'non-existent-job' }` - Applying to a job that doesn't exist.
6. **Time Travel**: `POST /jobs/job-id { createdAt: '2020-01-01T00:00:00Z' }` - Setting a fake creation date.
7. **PII Blanket Leak**: `GET /users` - Authenticated user trying to list all user profiles and their private data.
8. **Shadow Field Injection**: `POST /users/uid { ...validData, isAdmin: true }` - Injecting a non-existent security field.
9. **ID Poisoning**: `GET /users/very-long-junk-string-id-designed-to-exhaust-resources-12345`
10. **Application Sniping**: `GET /applications/app-id` - A different seeker trying to read another person's private application.
11. **Recruiter Spoofing**: `POST /jobs/job-id { recruiterId: 'seeker-uid' }` - A seeker trying to post as a recruiter.
12. **Mass Messaging**: `POST /messages/msg-id { ... }` - Unrestricted message creation without participant membership check.

## Test Strategy (Phase 0)
We will verify that all the above unauthorized operations return `PERMISSION_DENIED`.
