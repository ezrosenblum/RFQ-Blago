using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddedCategoryAndSubcategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Category",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Category", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Subcategory",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Note = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Subcategory", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationUserCategory",
                columns: table => new
                {
                    CategoriesId = table.Column<int>(type: "integer", nullable: false),
                    UsersId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUserCategory", x => new { x.CategoriesId, x.UsersId });
                    table.ForeignKey(
                        name: "FK_ApplicationUserCategory_AspNetUsers_UsersId",
                        column: x => x.UsersId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationUserCategory_Category_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CategorySubmission",
                columns: table => new
                {
                    CategoriesId = table.Column<int>(type: "integer", nullable: false),
                    SubmissionsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategorySubmission", x => new { x.CategoriesId, x.SubmissionsId });
                    table.ForeignKey(
                        name: "FK_CategorySubmission_Category_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CategorySubmission_Submission_SubmissionsId",
                        column: x => x.SubmissionsId,
                        principalTable: "Submission",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationUserSubcategory",
                columns: table => new
                {
                    SubcategoriesId = table.Column<int>(type: "integer", nullable: false),
                    UsersId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationUserSubcategory", x => new { x.SubcategoriesId, x.UsersId });
                    table.ForeignKey(
                        name: "FK_ApplicationUserSubcategory_AspNetUsers_UsersId",
                        column: x => x.UsersId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationUserSubcategory_Subcategory_SubcategoriesId",
                        column: x => x.SubcategoriesId,
                        principalTable: "Subcategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CategorySubcategory",
                columns: table => new
                {
                    CategoriesId = table.Column<int>(type: "integer", nullable: false),
                    SubcategoriesId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CategorySubcategory", x => new { x.CategoriesId, x.SubcategoriesId });
                    table.ForeignKey(
                        name: "FK_CategorySubcategory_Category_CategoriesId",
                        column: x => x.CategoriesId,
                        principalTable: "Category",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CategorySubcategory_Subcategory_SubcategoriesId",
                        column: x => x.SubcategoriesId,
                        principalTable: "Subcategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "SubcategorySubmission",
                columns: table => new
                {
                    SubcategoriesId = table.Column<int>(type: "integer", nullable: false),
                    SubmissionsId = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SubcategorySubmission", x => new { x.SubcategoriesId, x.SubmissionsId });
                    table.ForeignKey(
                        name: "FK_SubcategorySubmission_Subcategory_SubcategoriesId",
                        column: x => x.SubcategoriesId,
                        principalTable: "Subcategory",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_SubcategorySubmission_Submission_SubmissionsId",
                        column: x => x.SubmissionsId,
                        principalTable: "Submission",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUserCategory_UsersId",
                table: "ApplicationUserCategory",
                column: "UsersId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationUserSubcategory_UsersId",
                table: "ApplicationUserSubcategory",
                column: "UsersId");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubcategory_SubcategoriesId",
                table: "CategorySubcategory",
                column: "SubcategoriesId");

            migrationBuilder.CreateIndex(
                name: "IX_CategorySubmission_SubmissionsId",
                table: "CategorySubmission",
                column: "SubmissionsId");

            migrationBuilder.CreateIndex(
                name: "IX_SubcategorySubmission_SubmissionsId",
                table: "SubcategorySubmission",
                column: "SubmissionsId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ApplicationUserCategory");

            migrationBuilder.DropTable(
                name: "ApplicationUserSubcategory");

            migrationBuilder.DropTable(
                name: "CategorySubcategory");

            migrationBuilder.DropTable(
                name: "CategorySubmission");

            migrationBuilder.DropTable(
                name: "SubcategorySubmission");

            migrationBuilder.DropTable(
                name: "Category");

            migrationBuilder.DropTable(
                name: "Subcategory");
        }
    }
}
