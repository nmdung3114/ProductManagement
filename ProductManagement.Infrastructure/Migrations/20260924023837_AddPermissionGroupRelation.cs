using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPermissionGroupRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Group",
                table: "Permissions");

            migrationBuilder.AddColumn<Guid>(
                name: "PermissionGroupId",
                table: "Permissions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "PermissionGroups",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    DisplayOrder = table.Column<int>(type: "int", nullable: false, defaultValue: 0)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionGroups", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Permissions_PermissionGroupId",
                table: "Permissions",
                column: "PermissionGroupId");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionGroups_Name",
                table: "PermissionGroups",
                column: "Name",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Permissions_PermissionGroups_PermissionGroupId",
                table: "Permissions",
                column: "PermissionGroupId",
                principalTable: "PermissionGroups",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Permissions_PermissionGroups_PermissionGroupId",
                table: "Permissions");

            migrationBuilder.DropTable(
                name: "PermissionGroups");

            migrationBuilder.DropIndex(
                name: "IX_Permissions_PermissionGroupId",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "PermissionGroupId",
                table: "Permissions");

            migrationBuilder.AddColumn<string>(
                name: "Group",
                table: "Permissions",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                defaultValue: "");
        }
    }
}
