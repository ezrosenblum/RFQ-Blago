using Domain.Entities.Base;
using Domain.Entities.Submissions;
using Domain.Entities.User;
using Domain.Events.Categories;

namespace Domain.Entities.Categories;

public class Subcategory : BaseEntity
{
    public string Name { get; private set; } = null!;
    public string? Note { get; private set; }
    public IReadOnlyCollection<Category> Categories { get; private set; } = new List<Category>();
    public IReadOnlyCollection<ApplicationUser> Users { get; private set; } = new List<ApplicationUser>();
    public IReadOnlyCollection<Submission> Submissions { get; private set; } = new List<Submission>();

    private Subcategory() { }

    private Subcategory(string name, string? note, List<Category> categories)
    {
        Name = name;
        Note = note;
        Categories = categories;
    }

    public static Subcategory Create(string name, string? note, List<Category> categories)
    {
        var subcategory = new Subcategory(name, note, categories);
        subcategory.AddDomainEvent(new SubcategoryCreatedEvent(subcategory));
        return subcategory;
    }

    public void Update(string name, string? note, List<Category> categories)
    {
        Name = name;
        Note = note;
        Categories = categories;
        AddDomainEvent(new SubcategoryUpdatedEvent(this));
    }
}
