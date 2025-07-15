using Application.Features.Submissions.Commands;
using Application.Features.Submissions.Search;
using AutoMapper;
using Domain.Entities.Submissions;
using DTO.Enums.Submission;
using DTO.Submission;
using DTO.Submission.Report;
using System.Linq.Expressions;

namespace Application.Features.Submissions.Mappings;

public sealed class SubmissionMapperProfile : Profile
{
    public SubmissionMapperProfile()
    {
        CreateMap<SubmissionCreateRequest, SubmissionCreateCommand>()
            .ConstructUsing(src => new SubmissionCreateCommand(
                src.Description,
                src.Quantity,
                src.Unit,
                src.JobLocation));

        CreateMap<Submission, SubmissionResponse>()
            .ForMember(s => s.SubmissionDate, opt => opt.MapFrom(d => d.Created));
        CreateMap<Submission, SubmissionSearchable>()
            .ForMember(s => s.SubmissionDate, opt => opt.MapFrom(d => d.Created));

        CreateMap<SubmissionResponse, SubmissionSearchable>();

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
