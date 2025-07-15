﻿using Application.Common.Behaviours;
using Application.Common.Helpers;
using Application.Common.Localization;
using Application.Features.Users.Providers;
using AutoMapper;
using Domain.Entities.Users.Providers;
using Domain.Interfaces;
using DTO.Response;
using FluentValidation;
using MediatR;
using Microsoft.Extensions.DependencyInjection;
using System.Reflection;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        services.AddAutoMapper(assembly);
        services.AddSingleton(provider => new MapperConfiguration(cfg =>
        {
            var profiles = GetMapperProfilesWithParameterlessConstructor();

            foreach (var profile in profiles)
            {
                cfg.AddProfile(profile);
            }

            var dtoAssembly = Assembly.Load("DTO");

            // Get all enum types in the DTO assembly
            var enumTypes = dtoAssembly.GetTypes()
                                 .Where(t => t.IsEnum);

            foreach (var enumType in enumTypes)
            {
                var mapMethod = typeof(DependencyInjection).GetMethod(nameof(CreateEnumMap), BindingFlags.Static | BindingFlags.NonPublic);
                var genericMapMethod = mapMethod!.MakeGenericMethod(enumType);

                genericMapMethod.Invoke(null, new object[] { cfg, provider });
            }

        }).CreateMapper());


        services.AddMediatR(configuration =>
            configuration.RegisterServicesFromAssemblies(assembly));

        services.AddValidatorsFromAssembly(assembly);
        services.AddTransient(typeof(IPipelineBehavior<,>), typeof(ValidationBehaviour<,>));

        services.AddTransient<IAuthCodeProvider, VerificationCodeProvider>();
        return services;
    }

    private static List<Type> GetMapperProfilesWithParameterlessConstructor()
    {
        return Assembly.GetExecutingAssembly().GetTypes()
            .Where(type => type.IsClass && !type.IsAbstract && type.IsSubclassOf(typeof(Profile)))
            .Where(type => type.GetConstructor(Type.EmptyTypes) != null)
            .ToList();
    }
    private static void CreateEnumMap<TEnum>(IMapperConfigurationExpression cfg, IServiceProvider serviceProvider) where TEnum : Enum
    {
        var localizationService = serviceProvider.GetRequiredService<ILocalizationService>();

        cfg.CreateMap<TEnum, ListItemBaseResponse>()
            .ForMember(d => d.Id, opt => opt.MapFrom(s => Convert.ToInt32(s)))
            .ForMember(d => d.Name, opt => opt.MapFrom(s => EnumHelper.ToReadableString(s)));
    }
}
