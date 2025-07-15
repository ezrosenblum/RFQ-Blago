﻿using Application.Common.Search;
using Application.Features.Submissions.Search;
using Application.Features.Users.Search;
using DTO.Pagination;
using DTO.Sorting;
using Elasticsearch.Net;
using Microsoft.Extensions.Logging;
using Nest;
using Newtonsoft.Json;
using System.Reflection;

namespace Infrastructure.Search;

public class ElasticSearchClient<T> : ISearchClient<T> where T : class, ISearchable
{
    private readonly IElasticClient _elasticClient;
    private readonly ISearchIndexProvider _searchIndexProvider;
    private readonly ILogger<ElasticSearchClient<T>> _logger;
    private readonly string _index;

    public ElasticSearchClient(
        IElasticClient elasticClient,
        ISearchIndexProvider searchIndexProvider,
        ILogger<ElasticSearchClient<T>> logger)
    {
        _elasticClient = elasticClient;
        _searchIndexProvider = searchIndexProvider;
        _logger = logger;
        _index = _searchIndexProvider.GetIndex<T>();
    }
    public async Task IndexAndRefreshAsync(T document, CancellationToken cancellationToken = default)
    {
        await _elasticClient.IndexAsync(document, descripor => descripor.Index(_index).Refresh(Refresh.WaitFor), cancellationToken);
        await _elasticClient.Indices.RefreshAsync(_index, ct: cancellationToken);
    }
    public async Task IndexAsync(T document, CancellationToken cancellationToken = default)
    {
        await _elasticClient.IndexAsync(document, descripor => descripor.Index(_index), cancellationToken);
    }
    public async Task IndexManyAsync(IEnumerable<T> data, CancellationToken cancellationToken = default)
    {
        await _elasticClient.IndexManyAsync(data, _index, cancellationToken);
    }
    public async Task IndexAndRefreshManyAsync(IEnumerable<T> data, CancellationToken cancellationToken = default)
    {
        await _elasticClient.IndexManyAsync(data, _index, cancellationToken);
        await _elasticClient.Indices.RefreshAsync(_index, ct: cancellationToken);
    }


    public async Task DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        await _elasticClient.DeleteAsync<T>(id, descripor => descripor.Index(_index), cancellationToken);
    }

    public async Task DeleteAndRefreshAsync(int id, CancellationToken cancellationToken = default)
    {
        await _elasticClient.DeleteAsync<T>(id, descripor => descripor.Index(_index).Refresh(Refresh.WaitFor), cancellationToken);
        await _elasticClient.Indices.RefreshAsync(_index, ct: cancellationToken);
    }

    public async Task DeleteAllAsync(CancellationToken cancellationToken = default)
    {
        await _elasticClient.DeleteByQueryAsync<T>(q => q
            .Index(_index)
            .Query(rq => rq
                .MatchAll()
            ),
            cancellationToken);

        await _elasticClient.Indices.RefreshAsync(_index, ct: cancellationToken);
    }

    public async Task DeleteManyAsync(IEnumerable<T> data, CancellationToken cancellationToken = default)
    {
        await _elasticClient.DeleteManyAsync(data, _index, cancellationToken);
    }

    public async Task<PaginatedList<SubmissionSearchable>> SearchSubmissionsAsync(ISubmissionFullSearchCriteria criteria)
    {
        var searchResponse = await _elasticClient.SearchAsync<SubmissionSearchable>(s => s
            .Index(_index)
            .Query(q => BuildSubmissionSearchQuery(q, criteria))
            .Sort(so => BuildSort(so, criteria.Sorting!))
            .From((criteria.Paging.PageNumber - 1) * criteria.Paging.PageSize)
        .Size(criteria.Paging.PageSize));

        return new PaginatedList<SubmissionSearchable>(searchResponse.Documents.ToList(), (int)searchResponse.Total, criteria.Paging.PageNumber, criteria.Paging.PageSize);
    }
    private QueryContainer BuildSubmissionSearchQuery(QueryContainerDescriptor<SubmissionSearchable> descriptor, ISubmissionFullSearchCriteria criteria)
    {
        var combinedQuery = new QueryContainer();

        if (!string.IsNullOrWhiteSpace(criteria.Query))
        {
            combinedQuery &= (BuildTextQuery(criteria.Query) ||
                              BuildWildcardQuery("description", criteria.Query) ||
                              BuildWildcardQuery("user.firstName", criteria.Query) ||
                              BuildWildcardQuery("user.lastName", criteria.Query) ||
                              BuildWildcardQuery("jobLocation", criteria.Query));
        }

        if (criteria.UserId.HasValue)
        {
            combinedQuery &= new TermQuery
            {
                Field = "user.id",
                Value = criteria.UserId.Value
            };
        }

        if (criteria.Status.HasValue)
        {
            combinedQuery &= new TermQuery
            {
                Field = "status.id",
                Value = criteria.Status.Value
            };
        }

        if (criteria.Unit.HasValue)
        {
            combinedQuery &= new TermQuery
            {
                Field = "unit.id",
                Value = criteria.Unit.Value
            };
        }

        if (criteria.DateFrom != null)
        {
            var date = criteria.DateFrom.Value.Date;

            combinedQuery &= new DateRangeQuery
            {
                Field = "submissionDate",
                GreaterThanOrEqualTo = date,
            };
        }

        if (criteria.DateTo != null)
        {
            var date = criteria.DateTo.Value.Date.AddDays(1);

            combinedQuery &= new DateRangeQuery
            {
                Field = "submissionDate",
                LessThan = date,
            };
        }

        return combinedQuery;
    }
    private SortDescriptor<TDescriptor> BuildSort<TDescriptor, TSort>(SortDescriptor<TDescriptor> descriptor, SortOptions<TSort> sortOptions)
    where TDescriptor : class, ISearchable
    where TSort : Enum
    {
        if (sortOptions != null)
        {
            var fieldName = sortOptions.Field.ToString();

            var propertyInfo = FindProperty(typeof(TDescriptor), fieldName);

            if (propertyInfo != null)
            {
                var lowerFieldName = char.ToLower(fieldName[0]) + fieldName.Substring(1); // Assuming enum values directly correspond to field names
                var sortOrder = sortOptions.SortOrder == DTO.Sorting.SortOrder.Asc ? Nest.SortOrder.Ascending : Nest.SortOrder.Descending;

                // Check if the property is a string and append .keyword
                if (propertyInfo.PropertyType == typeof(string))
                {
                    lowerFieldName += ".keyword";
                }

                return descriptor.Field(lowerFieldName, sortOrder);
            }
            else
            {
                throw new ArgumentException($"Property {fieldName} not found in type {typeof(TDescriptor)} or its base types.");
            }
        }

        return descriptor;
    }

    private QueryContainer BuildTextQuery(string query)
    {
        return new QueryStringQuery
        {
            Query = query
        };
    }
    private QueryContainer BuildWildcardQuery(string field, string query)
    {
        return new WildcardQuery
        {
            Field = field, // Field to search
            Value = "*" + query.ToLowerInvariant() + "*", // Add wildcards to both sides of the query term
            Rewrite = MultiTermQueryRewrite.ConstantScore // Optional: Set the rewrite method
        };
    }
    private PropertyInfo FindProperty(Type type, string propertyName)
    {
        var property = type.GetProperty(propertyName);
        if (property != null)
        {
            return property;
        }

        foreach (var interfaceType in type.GetInterfaces())
        {
            property = interfaceType.GetProperty(propertyName);
            if (property != null)
            {
                return property;
            }
        }

        if (type.BaseType != null && type.BaseType != typeof(object))
        {
            return FindProperty(type.BaseType, propertyName);
        }

        return null;
    }

    public async Task<bool> IndexExist(string index)
    {
        try
        {
            var response = await _elasticClient.Indices.ExistsAsync(new IndexExistsRequest(index));
            return response.Exists;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while executing IndexExist");
            return false;
        }
    }

    public async Task<bool> CreateIndexIfNotExist(string index)
    {
        const int maxRetryAttempts = 10;
        const int delayBetweenRetries = 6000;

        try
        {
            for (int attempt = 1; attempt <= maxRetryAttempts; attempt++)
            {
                if (await IsElasticsearchAvailable())
                {
                    _logger.LogDebug("Connected to Elasticsearch after {0} attempt(s)", attempt);
                    break;
                }

                _logger.LogWarning("Elasticsearch not available. Retrying {0}/{1}...", attempt, maxRetryAttempts);

                if (attempt == maxRetryAttempts)
                {
                    _logger.LogError("Failed to connect to Elasticsearch after {0} attempts", maxRetryAttempts);
                    return false;
                }

                await Task.Delay(delayBetweenRetries);
            }

            var indexExistsResponse = await _elasticClient.Indices.ExistsAsync(index);
            if (!indexExistsResponse.Exists)
            {
                _logger.LogDebug("Creating index {0}", index);
                var createIndexResponse = await _elasticClient.Indices.CreateAsync(index, cid => cid.Map(m => m.AutoMap()));
                if (!createIndexResponse.IsValid)
                {
                    _logger.LogDebug("Failed to create index {0}. Response: {1}", index, JsonConvert.SerializeObject(createIndexResponse));
                    return false;
                }
                else
                {
                    _logger.LogDebug("Index {0} created", index);
                    return true;
                }
            }

            _logger.LogDebug("Creating index {0} skipped. Already exist", index);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while creating index {0}", index);
            return false;
        }
    }
    private async Task<bool> IsElasticsearchAvailable()
    {
        try
        {
            var pingResponse = await _elasticClient.PingAsync();
            return pingResponse.IsValid;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Ping to Elasticsearch failed.");
            return false;
        }
    }
}
