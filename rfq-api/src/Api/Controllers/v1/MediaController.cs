using Application.Features.Enums.Queries;
using Application.Features.Medias.Queries;
using DTO.Enums.Media;
using DTO.Response;
using Infrastructure.Authentication.Attributes;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers;

public class MediaController : ApiControllerBase
{
    [AllowAnonymous]
    [HttpGet("{mediaEntityType}/{entityId}/{mediaItemId}/download")]
    public async Task<FileStreamResult> Download(MediaEntityType mediaEntityType, int entityId, Guid mediaItemId)
    {
        var result = await Mediator.Send(new MediaDownloadQuery(mediaEntityType, entityId, mediaItemId));

        return File(result);
    }

    [HttpGet("entity-types")]
    public async Task<IReadOnlyCollection<ListItemBaseResponse>> GetMediaEntityTypes()
    {
        return await Mediator.Send(new GetEnumValuesQuery(typeof(MediaEntityType)));
    }

    [AllowAnonymous]
    [WorkerAuthorize]
    [HttpGet("{mediaEntityType}/{entityId}/{mediaItemId}/download/worker")]
    public async Task<Stream> DownloadFromWorker(MediaEntityType mediaEntityType, int entityId, Guid mediaItemId)
    {
        var result = await Mediator.Send(new MediaDownloadQuery(mediaEntityType, entityId, mediaItemId));
        return result.Content;
    }
}
