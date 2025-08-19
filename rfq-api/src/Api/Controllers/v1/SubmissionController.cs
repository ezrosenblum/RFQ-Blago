using Application.Common.Helpers;
using Application.Common.Interfaces;
using Application.Common.Localization;
using Application.Features.Submissions.Commands;
using Application.Features.Submissions.Queries;
using Application.Features.Submissions.Search;
using Application.Features.Submissions.SubmissionQuotes.Commands;
using Application.Features.Submissions.SubmissionQuotes.Queries;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Commands;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Queries;
using Application.Features.Submissions.SubmissionQuotes.QuoteMessages.Search;
using Application.Features.Submissions.SubmissionQuotes.Search;
using AutoMapper;
using DTO.Authentication;
using DTO.Enums.Submission;
using DTO.Enums.Submission.SubmissionQuote;
using DTO.Pagination;
using DTO.Response;
using DTO.Submission;
using DTO.Submission.Report;
using DTO.Submission.SubmissionQuote;
using DTO.Submission.SubmissionQuote.QuoteMessage;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1
{
    public class SubmissionController : ApiControllerBase
    {
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILocalizationService _localizationService;
        public SubmissionController(
            IMapper mapper,
            ICurrentUserService currentUserService,
            ILocalizationService localizationService)
        {
            _mapper = mapper;
            _currentUserService = currentUserService;
            _localizationService = localizationService;
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromForm] SubmissionCreateRequest request, List<IFormFile>? files)
        {
            await Mediator.Send((_mapper.Map<SubmissionCreateCommand>(request)) with { Files = files });

            return Ok();
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] SubmissionUpdateRequest request)
        {
            var mappedRequest = _mapper.Map<SubmissionUpdateCommand>(request);

            await Mediator.Send(mappedRequest with { Id = id });
            return Ok();
        }

        [HttpGet("{id:int}")]
        public async Task<SubmissionResponse> GetSubmission([FromRoute] int id)
        {
            return await Mediator.Send(new SubmissionGetQuery(id, true));
        }

        [Authorize(Policy = AuthorizationPolicies.Vendor)]
        [HttpGet]
        public async Task<IReadOnlyCollection<SubmissionResponse>> GetAll()
        {
            return await Mediator.Send(new SubmissionGetAllQuery());
        }

        [HttpPut("categories")]
        public async Task<IActionResult> UpdateCategories([FromBody] SubmissionUpdateCategoriesCommand command)
        {
            await Mediator.Send(command);
            return Ok();
        }

        [HttpPost("search")]
        public async Task<PaginatedList<SubmissionSearchable>> FullSearch([FromBody] SubmissionFullSearchQuery request)
        {
            return await Mediator.Send(request);
        }

        [Authorize(Policy = AuthorizationPolicies.Vendor)]
        [HttpPut("{id:int}/viewed")]
        public async Task<IActionResult> MarkAsViewed([FromRoute] int id)
        {
            await Mediator.Send(new SubmissionMarkAsViewedCommand(id));
            return Ok();
        }

        [Authorize(Roles = "Administrator")]
        [HttpPut("search/rebuild")]
        public async Task<IActionResult> RebuildSearchIndex()
        {
            await Mediator.Send(new SubmissionInitiateSearchIndexRebuildCommand());
            return Ok();
        }

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
            return EnumHelper.ToListItemBaseResponses<SubmissionUnit>(_localizationService);
        }

        [HttpGet("statuses")]
        public IReadOnlyCollection<ListItemBaseResponse> GetStatuses()
        {
            return EnumHelper.ToListItemBaseResponses<SubmissionStatus>(_localizationService);
        }

        [HttpPut("{id:int}/file")]
        public async Task<IActionResult> UploadFile([FromForm] IFormFile file, [FromRoute] int id)
        {
            await Mediator.Send(new SubmissionFileUploadCommand(id, file));
            return Ok();
        }

        [HttpDelete("{id:int}/file/{fileId:guid}")]
        public async Task<IActionResult> RemoveFile([FromRoute] int id, [FromRoute] Guid fileId)
        {
            await Mediator.Send(new SubmissionFileRemoveCommand(id, fileId));
            return Ok();
        }

        [Authorize(Policy = AuthorizationPolicies.Vendor)]
        [HttpPost("quote")]
        public async Task<IActionResult> QuoteCreate([FromForm] SubmissionQuoteCreateCommand request)
        {
            await Mediator.Send(request);

            return Ok();
        }

        [HttpPut("quote/{id:int}")]
        public async Task<IActionResult> UpdateSubmissionQuote([FromRoute] int id, [FromBody] SubmissionQuoteUpdateRequest request)
        {
            var command = _mapper.Map<SubmissionQuoteUpdateCommand>(request);

            await Mediator.Send(command with { SubmissionQuoteId = id });

            return Ok();
        }

        [HttpGet("quote/{id:int}")]
        public async Task<SubmissionQuoteResponse> GetSubmissionQuote([FromRoute] int id)
        {
            return await Mediator.Send(new SubmissionQuoteGetQuery(id));
        }

        [Authorize(Roles = "Administrator")]
        [HttpGet("quote")]
        public async Task<IReadOnlyCollection<SubmissionQuoteResponse>> GetAllQuotes()
        {
            return await Mediator.Send(new SubmissionQuoteGetAllQuery());
        }

        [HttpPost("quote/search")]
        public async Task<PaginatedList<SubmissionQuoteSearchable>> FullQuoteSearch([FromBody] SubmissionQuoteFullSearchQuery request)
        {
            return await Mediator.Send(request);
        }

        [HttpPut("quote/status/{id:int}")]
        public async Task<IActionResult> ChangeQuoteStatus([FromRoute] int id, [FromQuery] SubmissionQuoteStatus status)
        {
            await Mediator.Send(new SubmissionQuoteStatusChangeCommand(id, status));

            return Ok();
        }

        [Authorize(Roles = "Administrator")]
        [HttpPut("quote/search/rebuild")]
        public async Task<IActionResult> RebuildQuoteSearchIndex()
        {
            await Mediator.Send(new SubmissionQuoteInitiateSearchIndexRebuildCommand());
            return Ok();
        }

        [HttpPut("quote/{id:int}/file")]
        public async Task<IActionResult> QuoteUploadFile([FromForm] IFormFile file, [FromRoute] int id)
        {
            await Mediator.Send(new SubmissionQuoteFileUploadCommand(id, file));
            return Ok();
        }

        [HttpDelete("quote/{id:int}/file/{fileId:guid}")]
        public async Task<IActionResult> QuoteRemoveFile([FromRoute] int id, [FromRoute] Guid fileId)
        {
            await Mediator.Send(new SubmissionQuoteFileRemoveCommand(id, fileId));
            return Ok();
        }

        [HttpPut("quote/{id:int}/seen")]
        public async Task<IActionResult> MarkConversationAsSeen([FromRoute] int id)
        {
            await Mediator.Send(new QuoteMessageMarkConversationAsSeenCommand(id));

            return Ok();
        }

        [HttpGet("quote/validity-type")]
        public IReadOnlyCollection<ListItemBaseResponse> GetQuoteValidityTypes()
        {
            return EnumHelper.ToListItemBaseResponses<GlobalIntervalType>(_localizationService);
        }

        [HttpGet("quote/statuses")]
        public IReadOnlyCollection<ListItemBaseResponse> GetQuoteStatuses()
        {
            return EnumHelper.ToListItemBaseResponses<SubmissionQuoteStatus>(_localizationService);
        }

        [HttpPost("quote/message")]
        public async Task<IActionResult> QuoteMessageCreate([FromForm] QuoteMessageCreateRequest request)
        {
            var command = _mapper.Map<QuoteMessageCreateCommand>(request);

            await Mediator.Send(command with { SenderId = (int)_currentUserService.UserId! });

            return Ok();
        }

        [HttpGet("quote/message/{id:int}")]
        public async Task<QuoteMessageResponse> GetQuoteMessage([FromRoute] int id)
        {
            return await Mediator.Send(new QuoteMessageGetQuery(id));
        }

        [Authorize(Roles = "Administrator")]
        [HttpGet("quote/message")]
        public async Task<IReadOnlyCollection<QuoteMessageResponse>> GetAllQuoteMessages()
        {
            return await Mediator.Send(new QuoteMessageGetAllQuery());
        }

        [HttpPost("quote/message/search")]
        public async Task<PaginatedList<QuoteMessageSearchable>> FullQuoteMessageSearch([FromBody] QuoteMessageFullSearchQuery request)
        {
            return await Mediator.Send(request);
        }

        [Authorize(Roles = "Administrator")]
        [HttpPut("quote/message/search/rebuild")]
        public async Task<IActionResult> RebuildQuoteMessageSearchIndex()
        {
            await Mediator.Send(new QuoteMessageInitiateSearchIndexRebuildCommand());
            return Ok();
        }
    }
}
