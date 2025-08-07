using Application.Common.Interfaces;
using Application.Features.Notifications.Commands;
using Application.Features.Submissions.SubmissionQuotes.Commands;
using AutoMapper;
using DTO.Enums.Notification;
using DTO.MessageBroker.Messages.Submission.Quote;
using DTO.Notification;
using MassTransit;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace NotificationService.Consumers.Submission.SubmissionQuote;

public sealed class NewSubmissionQuoteMessageConsumer : IConsumer<NewSubmissionQuoteMessage>
{
    private readonly ISender _mediatr;

    public NewSubmissionQuoteMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<NewSubmissionQuoteMessage> context)
    {
        await _mediatr.Send(new SubmissionQuoteAlertForNewCommand(context.Message.QuoteId), context.CancellationToken);
    }
}
