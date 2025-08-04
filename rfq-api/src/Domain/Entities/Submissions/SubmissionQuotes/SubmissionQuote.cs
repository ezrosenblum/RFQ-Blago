using Domain.Entities.Base;
using Domain.Entities.Medias;
using Domain.Entities.User;
using Domain.Events;
using Domain.Events.Submissions;
using Domain.Events.Submissions.SubmissionQuotes;
using Domain.Interfaces;
using DTO.Enums.Media;
using DTO.Enums.Submission.SubmissionQuote;

namespace Domain.Entities.Submissions.SubmissionQuotes;

public class SubmissionQuote : BaseAuditableEntity, IHasDomainEvents, IWithMedia
{
    public string Title { get; private set; } = null!;
    public string Description { get; private set; } = null!;
    public decimal Price { get; private set; }
    public SubmissionQuoteValidityIntervalType QuoteValidityIntervalType { get; private set; }
    public SubmissionQuoteStatus Status { get; private set; } = SubmissionQuoteStatus.Pending;
    public int QuoteValidityInterval { get; private set; }
    public int SubmissionId { get; private set; }
    public int VendorId { get; private set; }

    public Media Media { get; private set; }

    public Submission Submission { get; private set; } = null!;
    public ApplicationUser Vendor { get; private set; } = null!;

    private SubmissionQuote() { }
    private SubmissionQuote(ISubmissionQuoteInsertData data)
    {
        Title = data.Title;
        Description = data.Description;
        Price = data.Price;
        QuoteValidityIntervalType = data.QuoteValidityIntervalType;
        QuoteValidityInterval = data.QuoteValidityInterval;
        SubmissionId = data.SubmissionId;
        VendorId = data.VendorId;
        Media = new Media(MediaEntityType.SubmissionQuote);

        AddDomainEvent(new SubmissionQuoteCreatedEvent(this));
    }
    public static SubmissionQuote Create(ISubmissionQuoteInsertData data)
    {
        return new SubmissionQuote(data);
    }
    public void Update(ISubmissionQuoteUpdateData data)
    {
        Title = data.Title;
        Description = data.Description;
        Price = data.Price;
        QuoteValidityIntervalType = data.QuoteValidityIntervalType;
        QuoteValidityInterval = data.QuoteValidityInterval;

        AddDomainEvent(new SubmissionQuoteUpdatedEvent(this));
    }

    public async Task UploadFile(IMediaUpsertData data, IMediaStorage mediaStorage)
    {
        await Media.Save(data, Id, mediaStorage);

        AddDomainEvent(new SubmissionQuoteUpdatedEvent(this));
    }

    public async Task RemoveFile(Guid fileId, IMediaStorage mediaStorage)
    {
        await Media.Delete(fileId, Id, mediaStorage);

        AddDomainEvent(new SubmissionQuoteUpdatedEvent(this));
    }
    
    public void ChangeStatus(SubmissionQuoteStatus newStatus)
    {
        if (Status == newStatus) 
            return;

        Status = newStatus;

        AddDomainEvent(new SubmissionQuoteUpdatedEvent(this));
    }
}
