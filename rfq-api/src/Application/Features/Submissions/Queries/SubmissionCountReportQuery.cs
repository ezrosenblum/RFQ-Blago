using Application.Common.Caching;
using Application.Common.Interfaces;
using Application.Common.Interfaces.Identity;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using AutoMapper;
using Domain.Entities.User;
using DTO.Submission.Report;
using DTO.User;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Application.Features.Submissions.Queries;

public sealed record SubmissionCountReportQuery() : IQuery<SubmissionReportResponse>;

public sealed class SubmissionCountReportQueryHandler : IQueryHandler<SubmissionCountReportQuery, SubmissionReportResponse>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly IMapper _mapper;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly ICurrentUserService _currentUserService;

    public SubmissionCountReportQueryHandler(
        IApplicationDbContext dbContext,
        IMapper mapper,
        UserManager<ApplicationUser> userManager,
        ICurrentUserService currentUserService)
    {
        _dbContext = dbContext;
        _mapper = mapper;
        _userManager = userManager;
        _currentUserService = currentUserService;
    }
    public async Task<SubmissionReportResponse> Handle(SubmissionCountReportQuery request, CancellationToken cancellationToken)
    {
        var customerId = await GetIdIfCustomerAsync(cancellationToken);

        var submissions = await _dbContext.Submission
            .Where(c => customerId == null ||
                        customerId == c.UserId)
            .AsNoTracking()
            .ToListAsync(cancellationToken);

        var response = _mapper.Map<SubmissionReportResponse>(submissions);

        return response;
    }

    private async Task<int?> GetIdIfCustomerAsync(CancellationToken cancellationToken = default)
    {
        var user = await _dbContext.User.FirstOrDefaultAsync(s => _currentUserService.UserId != null &&
                                                       s.Id == _currentUserService.UserId,
                                                       cancellationToken);

        if(user == null) return default;

        var roles = await _userManager.GetRolesAsync(user);

        if(roles.Any())
        {
            var userType = roles.First();

            if (userType == UserRole.Customer)
                return user.Id;
        }

        return default;
    }

}