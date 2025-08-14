using Application.Features.Submissions.SubmissionQuotes.Search;
using AutoMapper;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Submission.SubmissionQuote;
using DTO.Notification;
using DTO.Submission.SubmissionQuote;

namespace Application.Features.Submissions.Mappings;

public sealed class SubmissionQuoteMapperProfile : Profile
{
    public SubmissionQuoteMapperProfile()
    {
        CreateMap<SubmissionQuote, SubmissionQuoteResponse>()
            .ForMember(d => d.LastMessage, opt => opt.MapFrom(src => src.QuoteMessages
                                                                         .OrderByDescending(s => s.Created)
                                                                         .FirstOrDefault()))
            .ForMember(d => d.ValidUntil, opt => opt.MapFrom(src => CalculateValidUntil(src)));

        CreateMap<SubmissionQuote, SubmissionQuoteBaseResponse>()
            .ForMember(d => d.ValidUntil, opt => opt.MapFrom(src => CalculateValidUntil(src)));

        CreateMap<SubmissionQuote, SubmissionQuoteSearchable>()
            .ForMember(d => d.LastMessage, opt => opt.MapFrom(src => src.QuoteMessages
                                                                         .OrderByDescending(s => s.Created)
                                                                         .FirstOrDefault()))
            .ForMember(d => d.ValidUntil, opt => opt.MapFrom(src => CalculateValidUntil(src)));

        CreateMap<SubmissionQuoteBaseResponse, SubmissionQuoteSearchable>();

        CreateMap<SubmissionQuoteResponse, SubmissionQuoteSearchable>();

        CreateMap<SubmissionQuote, NewSubmissionQuoteData>()
            .ForMember(d => d.QuoteId, opt => opt.MapFrom(src => src.Id));
    }

    private static DateTime CalculateValidUntil(SubmissionQuote s) =>
    s.QuoteValidityIntervalType switch
    {
        GlobalIntervalType.Day => s.Created.AddDays(s.QuoteValidityInterval),
        GlobalIntervalType.Week => s.Created.AddDays(s.QuoteValidityInterval * 7),
        GlobalIntervalType.Month => s.Created.AddMonths(s.QuoteValidityInterval),
        GlobalIntervalType.Year => s.Created.AddYears(s.QuoteValidityInterval),
        _ => s.Created
    };

}
