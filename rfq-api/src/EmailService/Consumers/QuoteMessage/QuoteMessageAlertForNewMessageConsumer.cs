using DTO.MessageBroker.Messages.Submission.SubmissionQuote.QuoteMessage;
using EmailService.Models;
using EmailService.Services.Interfaces;
using MassTransit;

namespace EmailService.Consumers.QuoteMessage;

public sealed class QuoteMessageAlertForNewMessageConsumer : IConsumer<QuoteMessageAlertForNewMessage>
{
    private readonly ILogger<QuoteMessageAlertForNewMessageConsumer> _logger;
    private readonly IEmailSender _emailSender;
    private readonly ITemplateProvider _templateProivder;

    public QuoteMessageAlertForNewMessageConsumer(
        ILogger<QuoteMessageAlertForNewMessageConsumer> logger,
        IEmailSender emailSender,
        ITemplateProvider templateProivder)
    {
        _logger = logger;
        _emailSender = emailSender;
        _templateProivder = templateProivder;
    }
    public async Task Consume(ConsumeContext<QuoteMessageAlertForNewMessage> context)
    {
        _logger.LogInformation("Sending alert through email for new message to {email}", context.Message.Email);

        var parameters = new Dictionary<string, string>
        {
            { "@firstName", context.Message.FirstName },
            { "@lastName", context.Message.LastName },
            { "@quoteId", context.Message.SubmissionQuoteId.ToString() },
            { "@messageId", context.Message.QuoteMessageId.ToString() }
        };

        var htmlTemplateContent = await _templateProivder.GetTemplateAsync("QuoteMessage", "NewMessage", parameters);

        await _emailSender.SendAsync(new MailMessageRequest(
            context.Message.Email,
            "RFQSubmission - New Message Received",
            htmlTemplateContent,
            $"{context.Message.FirstName} {context.Message.LastName}"));
    }
}
