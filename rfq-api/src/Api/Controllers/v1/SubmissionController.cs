using Application.Common.Helpers;
using Application.Features.Submissions.Commands;
using Application.Features.Submissions.Queries;
using Application.Features.Submissions.Search;
using AutoMapper;
using DTO.Authentication;
using DTO.Enums.Submission;
using DTO.Pagination;
using DTO.Response;
using DTO.Submission;
using DTO.Submission.Report;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1
{
    public class SubmissionController : ApiControllerBase
    {
        private readonly IMapper _mapper;
        public SubmissionController(IMapper mapper)
        {
            _mapper = mapper;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] SubmissionCreateRequest request)
        {
            await Mediator.Send(_mapper.Map<SubmissionCreateCommand>(request));

            return Ok();
        }

        [Authorize(Policy = AuthorizationPolicies.Vendor)]
        [HttpGet]
        public async Task<IReadOnlyCollection<SubmissionResponse>> GetAll()
        {
            return await Mediator.Send(new SubmissionGetAllQuery());
        }

        [HttpPost("search")]
        public async Task<PaginatedList<SubmissionSearchable>> FullSearch([FromBody] SubmissionFullSearchQuery request)
        {
            return await Mediator.Send(request);
        }

        [Authorize(Policy = AuthorizationPolicies.Vendor)]
        [HttpPut("status/{id:int}")]
        public async Task<IActionResult> ChangeStatus([FromRoute] int id, [FromQuery] SubmissionStatus status)
        {
            await Mediator.Send(new SubmissionStatusChangeCommand(id, status));

            return Ok();
        }

        [HttpGet("count/report")]
        public async Task<SubmissionReportResponse> GetCountReport()
        {
            return await Mediator.Send(new SubmissionCountReportQuery());
        }

        [HttpGet("units")]
        public IReadOnlyCollection<ListItemBaseResponse> GetUnits()
        {
            return EnumHelper.ToListItemBaseResponses<SubmissionUnit>();
        }

        [HttpGet("statuses")]
        public IReadOnlyCollection<ListItemBaseResponse> GetStatuses()
        {
            return EnumHelper.ToListItemBaseResponses<SubmissionStatus>();
        }
    }
}
