using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressFieldsInCompanyDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "LatitudeAddress",
                table: "UserCompanyDetails",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LongitudeAddress",
                table: "UserCompanyDetails",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OperatingRadius",
                table: "UserCompanyDetails",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetAddress",
                table: "UserCompanyDetails",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LatitudeAddress",
                table: "UserCompanyDetails");

            migrationBuilder.DropColumn(
                name: "LongitudeAddress",
                table: "UserCompanyDetails");

            migrationBuilder.DropColumn(
                name: "OperatingRadius",
                table: "UserCompanyDetails");

            migrationBuilder.DropColumn(
                name: "StreetAddress",
                table: "UserCompanyDetails");
        }
    }
}
