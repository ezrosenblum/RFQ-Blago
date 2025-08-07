using Application.Common.Interfaces;
using Application.Common.Interfaces.Request;
using Application.Common.Interfaces.Request.Handlers;
using Application.Common.Search;
using Application.Features.Notifications.Commands;
using Application.Features.Submissions.SubmissionQuotes.Queries;
using Application.Features.Submissions.SubmissionQuotes.Search;
using AutoMapper;
using Domain.Entities.Submissions.SubmissionQuotes;
using DTO.Enums.Notification;
using DTO.Notification;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Nest;
using System.Text.Json;
using System.Threading;

namespace Application.Features.Submissions.SubmissionQuotes.Commands;

public sealed record SubmissionQuoteAlertForNewCommand(int SubmissionQuoteId) : ICommand;

public sealed record SubmissionQuoteAlertForNewCommandHandler : ICommandHandler<SubmissionQuoteAlertForNewCommand>
{
    private readonly IApplicationDbContext _dbContext;
    private readonly ISender _mediatr;
    private readonly IMapper _mapper;

    public SubmissionQuoteAlertForNewCommandHandler(
        IApplicationDbContext dbContext,
        ISender mediatr,
        IMapper mapper)
    {
        _dbContext = dbContext;
        _mediatr = mediatr;
        _mapper = mapper;
    }

    public async Task Handle(SubmissionQuoteAlertForNewCommand command, CancellationToken cancellationToken)
    {
        var quote = await _dbContext.SubmissionQuote
            .Include(s => s.Submission)
                .ThenInclude(s => s.User)
            .FirstOrDefaultAsync(s => s.Id == command.SubmissionQuoteId, cancellationToken);

        if (quote == null)
            return;

        if (quote.Submission.User.ReceivePushNotifications)
            await SendPushNotification(quote, cancellationToken);
    }

    private async Task SendPushNotification(SubmissionQuote quote, CancellationToken cancellationToken)
    {
        var mappedData = _mapper.Map<NewSubmissionQuoteData>(quote);

        var data = JsonSerializer.Serialize(mappedData);

        await _mediatr.Send(new NotificationCreateCommand(
            quote.Submission.UserId,
            "New Quote on your RFQ",
            "There was a new quote added on your RFQ. Check it out.",
            data,
            NotificationType.NewQuote),
            cancellationToken);
    }
}