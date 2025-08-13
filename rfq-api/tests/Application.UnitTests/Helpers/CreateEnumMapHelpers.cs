using Application.Common.Localization;
using AutoMapper;
using DTO.Response;
using Microsoft.Extensions.DependencyInjection;

namespace Application.UnitTests.Helpers;

public class CreateEnumMapHelpers
{
    //public static void CreateEnumMap<TEnum>(IMapperConfigurationExpression cfg) where TEnum : Enum
    //{
    //    cfg.CreateMap<TEnum, ListItemBaseResponse>()
    //        .ForMember(d => d.Id, opt => opt.MapFrom(s => Convert.ToInt32(s)))
    //        .ForMember(d => d.Name, opt => opt.MapFrom(s => s.ToString()));
    //}
    public static void CreateEnumMap<TEnum>(IMapperConfigurationExpression cfg, IServiceProvider serviceProvider) where TEnum : Enum
    {
        var localizationService = serviceProvider.GetRequiredService<ILocalizationService>();

        cfg.CreateMap<TEnum, ListItemBaseResponse>()
            .ForMember(d => d.Id, opt => opt.MapFrom(s => Convert.ToInt32(s)))
            .ForMember(d => d.Name, opt => opt.MapFrom(s => localizationService.GetValue(s)));
    }
}
