using Domain.Entities.Base;
using Domain.Entities.User;
using Domain.Events;
using Domain.Events.Submissions;
using DTO.Enums.Submission;

namespace Domain.Entities.Submissions
{
    public class Submission : BaseAuditableEntity, IHasDomainEvents
    {
        public string Description { get; private set; } = null!;
        public int Quantity { get; private set; }
        public SubmissionUnit Unit { get; private set; }
        public SubmissionStatus Status { get; private set; } = SubmissionStatus.PendingReview;
        public string JobLocation { get; private set; } = null!;
        public int UserId { get; private set; }

        public ApplicationUser User { get; private set; } = null!;

        private Submission() { }

        private Submission(ISubmissionInsertData data,
                           int userId)
        {
            Description = data.Description;
            Quantity = data.Quantity;
            Unit = data.Unit;
            JobLocation = data.JobLocation;
            UserId = userId;

            AddDomainEvent(new SubmissionCreatedEvent(this));
        }

        public static Submission Create(ISubmissionInsertData data,
                                        int userId)
        {
            return new Submission(data, userId);
        }

        public void ChangeStatus(SubmissionStatus newStatus)
        {
            if (Status == newStatus) 
                return;
            
            Status = newStatus;

            AddDomainEvent(new SubmissionUpdatedEvent(this));
        }
    }
}