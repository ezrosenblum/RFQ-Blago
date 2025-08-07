using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.MessageBroker;
using Application.Features.Notifications.Commands;
using AutoMapper;
using Domain.Entities.Submissions;
using Domain.Entities.User;
using DTO.Enums.Notification;
using DTO.MessageBroker.Messages.Submission;
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
    private readonly IMessagePublisher _messagePublisher;

    public SubmissionAlertForNewCommandHandler(
        IApplicationDbContext dbContext,
        ISender mediatr,
        IMapper mapper,
        IMessagePublisher messagePublisher)
    {
        _dbContext = dbContext;
        _mediatr = mediatr;
        _mapper = mapper;
        _messagePublisher = messagePublisher;
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

            if (vendor.ReceiveEmailNotifications)
                await SendEmailNotification(submission.Id, vendor, cancellationToken);
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
    private async Task SendEmailNotification(int submissionId, ApplicationUser user, CancellationToken cancellationToken)
    {
        await _messagePublisher.PublishAsync(
            new SubmissionAlertForNewMessage(
                submissionId, 
                user.FirstName, 
                user.LastName, 
                user.Email!), cancellationToken);
    }
}