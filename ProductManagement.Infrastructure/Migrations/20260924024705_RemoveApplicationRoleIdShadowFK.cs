using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ProductManagement.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveApplicationRoleIdShadowFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RolePermissions_AspNetRoles_ApplicationRoleId",
                table: "RolePermissions");

            migrationBuilder.DropIndex(
                name: "IX_RolePermissions_ApplicationRoleId",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "ApplicationRoleId",
                table: "RolePermissions");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ApplicationRoleId",
                table: "RolePermissions",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_ApplicationRoleId",
                table: "RolePermissions",
                column: "ApplicationRoleId");

            migrationBuilder.AddForeignKey(
                name: "FK_RolePermissions_AspNetRoles_ApplicationRoleId",
                table: "RolePermissions",
                column: "ApplicationRoleId",
                principalTable: "AspNetRoles",
                principalColumn: "Id");
        }
    }
}
