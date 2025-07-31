using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddCompanyDetailsInUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserCompanyDetails_UserId",
                table: "UserCompanyDetails");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyDetails_UserId",
                table: "UserCompanyDetails",
                column: "UserId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_UserCompanyDetails_UserId",
                table: "UserCompanyDetails");

            migrationBuilder.CreateIndex(
                name: "IX_UserCompanyDetails_UserId",
                table: "UserCompanyDetails",
                column: "UserId");
        }
    }
}
