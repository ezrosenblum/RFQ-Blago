using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Features.Notifications.Commands;
using AutoMapper;
using Domain.Entities.Submissions;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Notification;
using DTO.Notification;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Application.Features.Submissions.Commandsl;

public sealed record SubmissionAlertForNewCommand(int SubmissionId) : ICommand;

public sealed record SubmissionAlertForNewCommandHandler : ICommandHandler<SubmissionAlertForNewCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public SubmissionAlertForNewCommandHandler(
        IApplicationDbContext dbContext,
        ISender mediatr,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _mediatr = mediatr;
        _mapper = mapper;
    }

    public async Task Handle(SubmissionAlertForNewCommand command, CancellationToken cancellationToken)
    {
        var submission = await _dbContext.Submission
            .Include(s => s.Categories)
            .Include(s => s.Subcategories)
            .FirstOrDefaultAsync(s => s.Id == command.SubmissionId, cancellationToken);

        if (submission == null)
            return;

        var vendors = await _dbContext.User
            .Include(v => v.CompanyDetails)
            .Where(v => v.CompanyDetails != null)
            .ToListAsync(cancellationToken);

        foreach (var vendor in vendors)
        {
            if (vendor.ReceivePushNotifications)
                await SendPushNotification(submission, vendor.Id, cancellationToken);
        }
    }

    private async Task SendPushNotification(Submission submission, int userId, CancellationToken cancellationToken)
    {
        var mappedData = _mapper.Map<NewSubmissionData>(submission);

        var data = JsonSerializer.Serialize(mappedData);

        await _mediatr.Send(new NotificationCreateCommand(
            userId,
            "New RFQ was posted",
            "There was a new RFQ in your operating area that is in your categories. Check it out.",
            data,
            NotificationType.NewRFQ),
            cancellationToken);
    }
}