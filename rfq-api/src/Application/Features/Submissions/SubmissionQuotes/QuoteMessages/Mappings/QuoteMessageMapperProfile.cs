using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;
using AutoMapper;
using Domain.Entities.Submissions.SubmissionQuotes.QuoteMessages;
using DTO.Notification;
using DTO.Submission.SubmissionQuote.QuoteMessage;

namespace Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Mappings;

public sealed class QuoteMessageMapperProfile : Profile
{
    public QuoteMessageMapperProfile()
    {

        CreateMap<QuoteMessageCreateRequest, QuoteMessageCreateCommand>()
            .ConstructUsing(src => new QuoteMessageCreateCommand(
                src.Content,
                src.SubmissionQuoteId,
                default,
                src.Files));

        CreateMap<QuoteMessage, QuoteMessageResponse>();

        CreateMap<QuoteMessage, QuoteMessageSearchable>();

        CreateMap<QuoteMessageResponse, QuoteMessageSearchable>();

        CreateMap<QuoteMessage, NewQuoteMessageData>()
            .ForMember(d => d.QuoteMessageId, opt => opt.MapFrom(src => src.Id));
    }
}
