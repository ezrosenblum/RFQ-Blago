using Application.Common.Caching;
using Application.Common.Interfaces;
using Application.Common.MessageBroker;
using Application.Features.Users.Commands;
using Domain.Entities.Notifications;
using Domain.Events.Users;
using DTO.MessageBroker.Messages.Search;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Threading;

namespace Application.Features.Users.EventHandlers;

public sealed class UserUpdatedEventHandler : INotificationHandler<UserUpdatedEvent>
{
    private readonly IMessagePublisher _messagePublisher;
    private readonly IMediator _mediatr;
    private readonly IApplicationDbContext _dbContext;

    public UserUpdatedEventHandler(
        IMessagePublisher messagePublisher,
        IMediator mediatr,
        IApplicationDbContext applicationDbContext)
    {
        _messagePublisher = messagePublisher;
        _mediatr = mediatr;
        _dbContext = applicationDbContext;
    }
    public async Task Handle(UserUpdatedEvent notification, CancellationToken cancellationToken)
    {
        await _mediatr.Send(new UserIndexCommand(notification.User.Id), cancellationToken);

        await IndexUserSubmissions(notification.User.Id, cancellationToken);
        
        await IndexUserSubmissionQuotes(notification.User.Id, cancellationToken);

        await IndexUserQuoteMessages(notification.User.Id, cancellationToken);
    }
    private async Task IndexUserSubmissions(int userId, CancellationToken cancellationToken = default)
    {
        var submissions = await _dbContext.Submission.Where(s => s.UserId == userId).ToListAsync(cancellationToken);

        foreach (var submission in submissions)
        {
            await _messagePublisher.PublishAsync(new IndexSubmissionMessage(submission.Id), cancellationToken);
        }
    }

    private async Task IndexUserSubmissionQuotes(int userId, CancellationToken cancellationToken = default)
    {
        var submissionQuotes = await _dbContext.SubmissionQuote.Where(s => s.VendorId == userId).ToListAsync(cancellationToken);

        foreach (var submissionQuote in submissionQuotes)
        {
            await _messagePublisher.PublishAsync(new IndexSubmissionQuoteMessage(submissionQuote.Id), cancellationToken);
        }
    }

    private async Task IndexUserQuoteMessages(int userId, CancellationToken cancellationToken = default)
    {
        var quoteMessages = await _dbContext.QuoteMessage.Where(s => s.SenderId == userId).ToListAsync(cancellationToken);

        foreach (var quoteMessage in quoteMessages)
        {
            await _messagePublisher.PublishAsync(new IndexQuoteMessageMessage(quoteMessage.Id), cancellationToken);
        }
    }

}
