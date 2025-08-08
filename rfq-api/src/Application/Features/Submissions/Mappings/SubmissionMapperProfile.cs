using Application.Features.Submissions.Commands;
using Application.Features.Submissions.Search;
using AutoMapper;
using Domain.Entities.Submissions;
using Domain.Primitives;
using DTO.Enums.Submission;
using DTO.Notification;
using DTO.Response;
using DTO.Submission;
using DTO.Submission.Report;
using DTO.Submission.SubmissionStatusHistory;

namespace Application.Features.Submissions.Mappings;

public sealed class SubmissionMapperProfile : Profile
{
    public SubmissionMapperProfile()
    {
        CreateMap<SubmissionCreateRequest, SubmissionCreateCommand>()
            .ConstructUsing(src => new SubmissionCreateCommand(
                src.Title,
                src.Description,
                src.Quantity,
                src.Unit,
                src.JobLocation,
                src.StreetAddress,
                src.LatitudeAddress,
                src.LongitudeAddress,
                default));

        CreateMap<Submission, SubmissionBaseResponse>()
            .ForMember(s => s.SubmissionDate, opt => opt.MapFrom(d => d.Created));

        CreateMap<Submission, SubmissionResponse>()
            .ForMember(s => s.StatusHistoryCount, opt => opt.MapFrom(d => d.StatusHistory.GroupBy(s => s.Status)
                                                                                         .Select(s => new SubmissionStatusHistoryCountResponse()
                                                                                         {
                                                                                             Status = new ListItemBaseResponse()
                                                                                             {
                                                                                                 Id = (int)s.Key,
                                                                                                 Name = s.Key.ToString()
                                                                                             },
                                                                                             Count = s.Count()
                                                                                         })
                                                                                         .ToList()))
            .ForMember(s => s.Quotes, opt => opt.MapFrom(d => d.SubmissionQuotes))
            .ForMember(s => s.SubmissionDate, opt => opt.MapFrom(d => d.Created));

        CreateMap<Submission, SubmissionSearchable>()
            .ForMember(s => s.StatusHistoryCount, opt => opt.MapFrom(d => d.StatusHistory.GroupBy(s => s.Status)
                                                                                         .Select(s => new SubmissionStatusHistoryCountResponse()
                                                                                         {
                                                                                             Status = new ListItemBaseResponse()
                                                                                             {
                                                                                                 Id = (int)s.Key,
                                                                                                 Name = s.Key.ToString()
                                                                                             },
                                                                                             Count = s.Count()
                                                                                         })
                                                                                         .ToList()))
            .ForMember(s => s.Quotes, opt => opt.MapFrom(d => d.SubmissionQuotes))
            .ForMember(s => s.SubmissionDate, opt => opt.MapFrom(d => d.Created));

        CreateMap<StatusHistory, SubmissionStatusHistoryResponse>();

        CreateMap<SubmissionResponse, SubmissionSearchable>();

        CreateMap<Submission, NewSubmissionData>()
            .ForMember(s => s.SubmissionId, opt => opt.MapFrom(d => d.Id));

        CreateMap<List<Submission>, SubmissionReportResponse>()
            .ForMember(s => s.SubmissionsCount, opt => opt.MapFrom(d => d.Count()))
            .ForMember(s => s.Last24HoursSubmissionsCount, opt => opt.MapFrom(d => d.Where(s => s.Created.ToUniversalTime() > DateTime.Now.AddDays(-1).ToUniversalTime())
                                                                                    .Count()))
            .ForMember(s => s.ReviewedSubmissionsCount, opt => opt.MapFrom(d => d.Where(s => s.Status == SubmissionStatus.Rejected ||
                                                                                             s.Status == SubmissionStatus.Accepted)
                                                                                 .Count()))
            .ForMember(s => s.RejectedSubmissionsCount, opt => opt.MapFrom(d => d.Where(s => s.Status == SubmissionStatus.Rejected)
                                                                                 .Count()))
            .ForMember(s => s.AcceptedSubmissionsCount, opt => opt.MapFrom(d => d.Where(s => s.Status == SubmissionStatus.Accepted)
                                                                                 .Count()))
            .ForMember(s => s.PendingSubmissionsCount, opt => opt.MapFrom(d => d.Where(s => s.Status == SubmissionStatus.PendingReview)
                                                                                .Count()));
    }
}
