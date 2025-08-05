using Domain.Entities.Base;
using Domain.Entities.Submissions;
using Domain.Entities.User;
using Domain.Events.Categories;

namespace Domain.Entities.Categories;

public class Category : BaseEntity
{
    public string Name { get; private set; } = null!;
    public string? Note { get; private set; }

    public IReadOnlyCollection<Subcategory> Subcategories { get; private set; } = new List<Subcategory>();
    public IReadOnlyCollection<ApplicationUser> Users { get; private set; } = new List<ApplicationUser>();
    public IReadOnlyCollection<Submission> Submissions { get; private set; } = new List<Submission>();

    private Category() { }
    private Category(string name, string? note, List<Subcategory> subcategories)
    {
        Name = name;
        Note = note;
        Subcategories = subcategories;
    }

    public static Category Create(string name, string? note, List<Subcategory> subcategories)
    {
        var category = new Category(name, note, subcategories);
        category.AddDomainEvent(new CategoryCreatedEvent(category));
        return category;
    }

    public void Update(string name, string? note, List<Subcategory> subcategories)
    {
        Name = name;
        Note = note;
        Subcategories = subcategories;
        AddDomainEvent(new CategoryUpdatedEvent(this));
    }
}
