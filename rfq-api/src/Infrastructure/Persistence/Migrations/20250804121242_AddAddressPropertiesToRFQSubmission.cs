using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressPropertiesToRFQSubmission : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "LatitudeAddress",
                table: "Submission",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "LongitudeAddress",
                table: "Submission",
                type: "double precision",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "StreetAddress",
                table: "Submission",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LatitudeAddress",
                table: "Submission");

            migrationBuilder.DropColumn(
                name: "LongitudeAddress",
                table: "Submission");

            migrationBuilder.DropColumn(
                name: "StreetAddress",
                table: "Submission");
        }
    }
}
