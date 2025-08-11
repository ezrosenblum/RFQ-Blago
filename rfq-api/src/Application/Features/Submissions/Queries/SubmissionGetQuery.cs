using Application.Common.Exceptions;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Localization;
using AutoMapper;
using DTO.Enums.Submission;
using DTO.Response;
using DTO.Submission;
using DTO.Submission.SubmissionStatusHistory;
using DTO.User;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionGetQuery(int SubmissionId, bool ReturnCount = false) : IQuery<SubmissionResponse>;

public sealed class SubmissionGetQueryHandler : IQueryHandler<SubmissionGetQuery, SubmissionResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly ILocalizationService _localizationService;
    private readonly ICurrentUserService _currentUserService;

    public SubmissionGetQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        ILocalizationService localizationService,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _localizationService = localizationService;
        _currentUserService = currentUserService;
    }
    public async Task<SubmissionResponse> Handle(SubmissionGetQuery query, CancellationToken cancellationToken)
    {
        var submission = await _dbContext.Submission
                             .AsNoTracking()
                             .Include(s => s.User)
                             .Include(s => s.Categories)
                             .Include(s => s.Subcategories)
                             .FirstOrDefaultAsync(s => s.Id == query.SubmissionId, cancellationToken);

        if (submission == null)
            throw new NotFoundException(_localizationService.GetValue("submission.notFound.error.message"));

        var response = _mapper.Map<SubmissionResponse>(submission);

        if (query.ReturnCount)
        {
            if (_currentUserService.UserRole == UserRole.Vendor)
                response = SetVendorStatuses(response);

            response = RemoveHistoryItems(response);
        }

        return response;
    }
    private SubmissionResponse SetVendorStatuses(SubmissionResponse item)
    {
        var vendorStatus = item.StatusHistory
            .OrderByDescending(s => s.DateCreated)
            .FirstOrDefault(s => s.VendorId == _currentUserService.UserId);

        item.VendorStatus = vendorStatus?.Status ?? new ListItemBaseResponse()
        {
            Id = (int)SubmissionStatusHistoryType.New,
            Name = _localizationService.GetValue($"enum.submissionStatusHistoryType.{SubmissionStatusHistoryType.New.ToString().ToLower()}")
        };

        return item;
    }
    private SubmissionResponse RemoveHistoryItems(SubmissionResponse item)
    {
        if (_currentUserService.UserRole == UserRole.Vendor)
        {
            item.StatusHistory = item.StatusHistory
                .Where(s => s.VendorId == _currentUserService.UserId)
                .OrderByDescending(s => s.DateCreated)
                .ToList();
            item.StatusHistoryCount = new List<SubmissionStatusHistoryCountResponse>();
        }

        else
            item.StatusHistory = new List<SubmissionStatusHistoryResponse>();

        return item;
    }
}
