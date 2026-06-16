using JobTrackr.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace JobTrackr.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<JobApplication> Applications => Set<JobApplication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<JobApplication>(entity =>
        {
            // Persist the enum as its name ("Applied") rather than an int, so the
            // database is human-readable and resilient to enum reordering.
            entity.Property(a => a.Status)
                .HasConversion<string>()
                .HasMaxLength(20);

            entity.HasOne(a => a.User)
                .WithMany(u => u.Applications)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasIndex(a => a.UserId);
        });
    }
}
