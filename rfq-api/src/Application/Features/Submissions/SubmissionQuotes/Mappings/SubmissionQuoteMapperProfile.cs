using Application.Features.Submissions.SubmissionQuotes.Commands;
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
            .ForMember(d => d.SubmissionId, opt => opt.MapFrom(src => src.Submission.Id))
            .ForMember(d => d.QuoteId, opt => opt.MapFrom(src => src.Id));

        CreateMap<SubmissionQuoteUpdateRequest, SubmissionQuoteUpdateCommand>()
            .ConstructUsing(src => new SubmissionQuoteUpdateCommand(
                default,
                src.Title,
                src.Description,
                src.Price,
                src.QuoteValidityIntervalType,
                src.QuoteValidityInterval,
                src.TimelineIntervalType,
                src.MinimumTimelineDuration,
                src.MaximumTimelineDuration,
                src.WarantyIntervalType,
                src.WarantyDuration));
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
