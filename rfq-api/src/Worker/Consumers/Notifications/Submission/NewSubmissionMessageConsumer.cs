using Application.Features.Submissions.Commandsl;
using DTO.MessageBroker.Messages.Submission;
using MassTransit;
using MediatR;

namespace Worker.Consumers.Notifications.Submission;

public sealed class NewSubmissionMessageConsumer : IConsumer<NewSubmissionMessage>
{
    private readonly ISender _mediatr;

    public NewSubmissionMessageConsumer(ISender mediatr)
    {
        _mediatr = mediatr;
    }
    public async Task Consume(ConsumeContext<NewSubmissionMessage> context)
    {
        await _mediatr.Send(new SubmissionAlertForNewCommand(context.Message.SubmissionId), context.CancellationToken);
    }
}
