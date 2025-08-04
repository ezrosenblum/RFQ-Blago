using DTO.Medias;
using DTO.Response;
using DTO.User;

namespace DTO.Submission.SubmissionQuote;

public record SubmissionQuoteBaseResponse
{
    public int Id { get; init; }
    public string Title { get; init; } = null!;
    public string Description { get; init; } = null!;
    public decimal Price { get; init; }
    public ListItemBaseResponse QuoteValidityIntervalType { get; init; } = new();
    public int QuoteValidityInterval { get; init; }
    public DateTime ValidUntil { get; init; }
    public int SubmissionId { get; init; }
    public int VendorId { get; init; }
    public UserResponse Vendor { get; init; } = new();
    public DateTime Created { get; init; }
    public MediaResponse Media { get; init; } = new();

}
