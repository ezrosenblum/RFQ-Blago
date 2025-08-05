using Domain.Entities.Base;
using Domain.Entities.Categories;
using Domain.Entities.Medias;
using Domain.Entities.Submissions.SubmissionQuotes;
using Domain.Entities.User;
using Domain.Events;
using Domain.Events.Submissions;
using Domain.Interfaces;
using DTO.Enums.Media;
using DTO.Enums.Submission;
using Microsoft.AspNetCore.Http;

namespace Domain.Entities.Submissions
{
    public class Submission : BaseAuditableEntity, IHasDomainEvents, IWithMedia
    {
        public string Description { get; private set; } = null!;
        public int Quantity { get; private set; }
        public SubmissionUnit Unit { get; private set; }
        public SubmissionStatus Status { get; private set; } = SubmissionStatus.PendingReview;
        public string JobLocation { get; private set; } = null!;
        public string? StreetAddress { get; private set; }
        public double? LongitudeAddress { get; private set; }
        public double? LatitudeAddress { get; private set; }
        public int UserId { get; private set; }
        public Media Media { get; private set; } = null!;

        public ApplicationUser User { get; private set; } = null!;

        public virtual ICollection<SubmissionQuote> SubmissionQuotes { get; set; } = new List<SubmissionQuote>();

        public IReadOnlyCollection<Category> Categories { get; private set; } = new List<Category>();
        public IReadOnlyCollection<Subcategory> Subcategories { get; private set; } = new List<Subcategory>();

        private Submission() { }

        private Submission(ISubmissionInsertData data,
                           int userId)
        {
            Description = data.Description;
            Quantity = data.Quantity;
            Unit = data.Unit;
            JobLocation = data.JobLocation;
            UserId = userId;
            StreetAddress = data.StreetAddress;
            LongitudeAddress = data.LongitudeAddress;
            LatitudeAddress = data.LatitudeAddress;

            Media = new Media(MediaEntityType.Submission);

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

        public async Task UploadFile(IMediaUpsertData data, IMediaStorage mediaStorage)
        {
            await Media.Save(data, Id, mediaStorage);

            AddDomainEvent(new SubmissionUpdatedEvent(this));
        }

        public async Task RemoveFile(Guid fileId, IMediaStorage mediaStorage)
        {
            await Media.Delete(fileId, Id, mediaStorage);

            AddDomainEvent(new SubmissionUpdatedEvent(this));
        }
    }
}