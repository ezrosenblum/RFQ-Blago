using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class SeedCategoryAndSubcategory : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                -- STEP 1: Insert Categories (if they don't exist)
                INSERT INTO ""Category"" (""Name"")
                SELECT DISTINCT Category
                FROM (
                    VALUES
                    ('Concrete'),
                    ('Masonry'),
                    ('Wood & Timber'),
                    ('Metals'),
                    ('Drywall & Finishes'),
                    ('Roofing'),
                    ('Insulation'),
                    ('Windows & Doors'),
                    ('Flooring'),
                    ('Plumbing Materials'),
                    ('Electrical Materials'),
                    ('HVAC Materials'),
                    ('Fasteners & Anchors'),
                    ('Exterior Finishes'),
                    ('Fire Protection'),
                    ('Elevators & Escalators'),
                    ('Acoustic Materials'),
                    ('Specialty Materials'),
                    ('Temporary Construction'),
                    ('Signage & Wayfinding'),
                    ('Landscaping Materials')
                ) AS Categories(Category)
                WHERE NOT EXISTS (SELECT 1 FROM ""Category"" WHERE ""Name"" = Category);

                -- STEP 2: Insert Subcategories (if they don't exist)
                INSERT INTO ""Subcategory"" (""Name"", ""Note"")
                SELECT Subcategory, Note
                FROM (
                    VALUES
                    ('Ready-Mix Concrete', 'Pre-mixed concrete delivered to site used for slabs foundations etc.'),
                    ('Precast Concrete', 'Factory-made components like beams columns or panels for quick assembly.'),
                    ('Concrete Blocks (CMU)', 'Cinder or concrete masonry units for walls foundations or partitions.'),
                    ('Rebar', 'Steel reinforcement bars for strengthening concrete structures.'),
                    ('Concrete Admixtures', 'Chemicals to enhance concrete properties like strength or curing time.'),
                    ('Post-Tensioning Systems', 'Cables and anchors for large-scale slabs or bridges in commercial buildings.'),
                    ('High-Strength Concrete', 'Specialized mix for high-rise structures or heavy-load applications.'),
                    ('Polished Concrete Aggregates', 'Decorative aggregates for exposed concrete floors or surfaces.'),
                    ('Brick', 'Clay or concrete bricks for walls facades or fireplaces.'),
                    ('Stone (Natural)', 'Granite limestone or sandstone for veneers walls'),
                    ('Mortar', 'Binding material for brick block or stone masonry.'),
                    ('Stucco', 'Exterior plaster finish for walls often textured.'),
                    ('Glass Block', 'Translucent blocks for decorative or light-transmitting partitions.'),
                    ('Thin Stone Veneer', 'Lightweight stone slices for interior or exterior decorative cladding.'),
                    ('Dimensional Lumber', 'Standard cut lumber (e.g. 2x4 2x6) for framing or structural use.'),
                    ('Plywood', 'Layered wood sheets for sheathing subfloors or formwork.'),
                    ('Engineered Wood (LVL', 'Glulam) Laminated veneer lumber or glued laminated timber for beams or joists.'),
                    ('Treated Lumber', 'Pressure-treated wood for outdoor or moisture-prone applications.'),
                    ('Hardwood', 'Oak maple or walnut for flooring trim'),
                    ('Wood Veneer', 'Thin wood sheets for high-end cabinetry or paneling in commercial interiors.'),
                    ('Structural Steel', 'Beams columns or angles for large-scale frameworks in high-rises.'),
                    ('Rebar (Steel Reinforcement)', 'Steel bars for reinforcing concrete (also listed under Concrete).'),
                    ('Metal Studs', 'Lightweight steel framing for non-load-bearing walls in offices.'),
                    ('Sheet Metal', 'Galvanized or stainless steel for roofing flashing or ductwork.'),
                    ('Aluminum', 'Lightweight metal for window frames siding or railings.'),
                    ('Curtain Wall Systems', 'Aluminum and glass systems for high-rise building facades.'),
                    ('Stainless Steel', 'Corrosion-resistant steel for railings cladding or specialty finishes.'),
                    ('Custom Aluminum Trims', 'Precision-cut aluminum for decorative or functional drywall corners and edges.'),
                    ('Drywall (Gypsum Board)', 'Wallboard for interior walls and ceilings in office or retail spaces.'),
                    ('Joint Compound', 'Used to seal drywall joints and create smooth surfaces.'),
                    ('Plaster', 'Traditional wall finish often used for decorative purposes.'),
                    ('Paint', 'Interior/exterior coatings for aesthetic and protective purposes.'),
                    ('Wallpaper', 'Decorative wall covering less common in commercial projects.'),
                    ('Acoustic Panels', 'Sound-absorbing panels for conference rooms or auditoriums.'),
                    ('Sheetrock Reveals', 'Metal or vinyl beads for clean modern drywall edges or transitions.'),
                    ('Corner Beads', 'Metal or plastic beads to protect and define drywall corners.'),
                    ('Control Joints', 'Beads or strips to manage drywall expansion/contraction in large walls.'),
                    ('Custom Drywall Trims (Aluminum)', 'Specialty aluminum trims for unique corner or edge finishes in high-end projects.'),
                    ('Level 5 Finish Materials', 'Skim-coat products for ultra-smooth drywall finishes in premium interiors.'),
                    ('Asphalt Shingles', 'Common roofing material for smaller commercial buildings.'),
                    ('Metal Roofing', 'Durable steel or aluminum panels for commercial or industrial use.'),
                    ('Membrane Roofing (EPDM', 'TPO) Single-ply roofing for flat or low-slope commercial roofs.'),
                    ('Clay/Concrete Tiles', 'Durable aesthetic roofing for high-end commercial projects.'),
                    ('Slate', 'Premium long-lasting natural stone roofing material.'),
                    ('Green Roofing Systems', 'Vegetated roofs for sustainability and insulation in commercial buildings.'),
                    ('Roof Ballast (Pavers', 'Gravel) Weighting materials for flat roof systems to secure membranes.'),
                    ('Fiberglass Batt', 'Common insulation for walls and attics cost-effective.'),
                    ('Spray Foam', 'High-performance insulation for air sealing and thermal resistance.'),
                    ('Rigid Foam (EPS', 'XPS) Polystyrene or polyiso boards for walls roofs or foundations.'),
                    ('Cellulose', 'Eco-friendly blown-in insulation for attics or walls.'),
                    ('Mineral Wool', 'Fire-resistant insulation for commercial buildings with strict codes.'),
                    ('Reflective Insulation', 'Foil-faced materials for radiant heat control in commercial roofs or walls.'),
                    ('Vinyl Windows', 'Cost-effective energy-efficient windows for smaller commercial projects.'),
                    ('Aluminum Windows', 'Durable low-maintenance windows for commercial or modern designs.'),
                    ('Wood Doors', 'Solid or engineered wood for interior/exterior applications.'),
                    ('Metal Doors', 'Steel or aluminum doors for security or commercial use.'),
                    ('Glass (Tempered', 'Laminated) Safety glass for windows doors or glazing applications.'),
                    ('Automatic Sliding Doors', 'Glass or metal doors for high-traffic commercial entrances.'),
                    ('Fire-Rated Doors', 'Steel or composite doors for fire safety in commercial buildings.'),
                    ('Blast-Resistant Glazing', 'Specialized glass for high-security commercial or government buildings.'),
                    ('Hardwood Flooring', 'Oak maple or exotic woods for high-end commercial lobbies or offices.'),
                    ('Ceramic/Porcelain Tile', 'Durable water-resistant flooring for kitchens bathrooms or lobbies.'),
                    ('Carpet', 'Soft flooring for offices hotels or commercial spaces.'),
                    ('Vinyl (LVT', 'Sheet) Cost-effective durable flooring for high-traffic areas like retail.'),
                    ('Concrete Flooring', 'Polished or stained concrete for industrial or modern aesthetics.'),
                    ('Raised Access Flooring', 'Modular flooring for data centers or offices with underfloor wiring.'),
                    ('Epoxy Flooring', 'Seamless chemical-resistant coating for industrial or commercial floors.'),
                    ('Terrazzo', 'Polished stone-chip flooring for high-end commercial lobbies or public spaces.'),
                    ('PVC Piping', 'Plastic piping for water supply or drainage lightweight.'),
                    ('Copper Piping', 'Durable corrosion-resistant piping for water supply lines.'),
                    ('PEX Piping', 'Flexible plastic piping for water distribution easy to install.'),
                    ('Cast Iron Piping', 'Heavy-duty piping for drainage or sewer systems in commercial projects.'),
                    ('Fittings & Valves', 'Connectors elbows and valves for plumbing systems.'),
                    ('Commercial-Grade Fixtures', 'Sinks toilets or urinals designed for high-traffic restrooms.'),
                    ('Grease Interceptors', 'Devices for capturing grease in commercial kitchen drainage systems.'),
                    ('Wiring (Romex', 'THHN) Copper or aluminum wiring for power distribution in commercial systems.'),
                    ('Conduit (PVC', 'Metal) Protective tubing for electrical wiring often required in commercial.'),
                    ('Electrical Boxes', 'Junction or outlet boxes for housing electrical connections.'),
                    ('Circuit Breakers', 'Safety devices for electrical panels in large-scale systems.'),
                    ('Lighting Fixtures', 'LED fluorescent or incandescent fixtures for various applications.'),
                    ('Emergency Lighting', 'Battery-backed lighting for safety in commercial buildings.'),
                    ('Cable Trays', 'Metal trays for organizing and supporting electrical cables in commercial projects.'),
                    ('Ductwork', 'Metal or flexible ducts for air distribution in HVAC systems.'),
                    ('Insulation (Duct Wrap)', 'Fiberglass wrap for insulating HVAC ducts.'),
                    ('Piping (Refrigerant Lines)', 'Copper tubing for HVAC refrigerant systems in large commercial setups.'),
                    ('Vents & Grilles', 'Air distribution components for HVAC systems in offices or retail.'),
                    ('Chillers', 'Large-scale cooling units for commercial HVAC systems.'),
                    ('VAV Boxes', 'Variable air volume boxes for zoned HVAC control in commercial spaces.'),
                    ('Air Handling Units', 'Centralized units for air circulation in large commercial buildings.'),
                    ('Nails', 'Common fasteners for wood framing or roofing.'),
                    ('Screws', 'Drywall wood or metal screws for various applications.'),
                    ('Bolts & Anchors', 'Heavy-duty fasteners for concrete or steel connections in high-rises.'),
                    ('Adhesives & Sealants', 'Construction adhesives or caulks for bonding or sealing.'),
                    ('Chemical Anchors', 'Epoxy or resin-based anchors for heavy-duty concrete connections.'),
                    ('Siding (Vinyl', 'Fiber Cement) Exterior wall cladding for weather protection and aesthetics.'),
                    ('Brick Veneer', 'Thin brick layer for exterior aesthetic without structural load.'),
                    ('EIFS (Exterior Insulation Finish)', 'Synthetic stucco system for insulation and exterior finish.'),
                    ('Cladding (Metal', 'Wood) Decorative or protective panels for exterior walls of commercial buildings.'),
                    ('ACM Panels (Aluminum Composite)', 'Lightweight durable panels for modern commercial facades.'),
                    ('Precast Architectural Panels', 'Decorative concrete panels for aesthetic and structural facades.'),
                    ('Fire Sprinkler Piping', 'Steel or CPVC piping for fire suppression systems in commercial buildings.'),
                    ('Fireproofing Spray', 'Intumescent or cementitious coatings for steel structures.'),
                    ('Firestop Sealants', 'Caulks or sealants for sealing gaps to prevent fire spread.'),
                    ('Fire-Rated Insulation', 'Specialized insulation for fire barriers in commercial buildings.'),
                    ('Elevator Cabs', 'Prefabricated cabs for passenger or freight elevators in high-rises.'),
                    ('Escalator Components', 'Tracks steps and handrails for escalators in commercial spaces.'),
                    ('Elevator Control Systems', 'Electrical panels and software for elevator operation and safety.'),
                    ('Acoustic Ceiling Tiles', 'Sound-absorbing tiles for commercial offices schools or auditoriums.'),
                    ('Soundproofing Membranes', 'Barriers for reducing sound transmission in commercial buildings.'),
                    ('Specialty Ceiling Grids', 'Metal grid systems (e.g. concealed or decorative) for acoustic or aesthetic ceilings.'),
                    ('Acoustic Wall Panels', 'Fabric or foam panels for sound control in conference rooms or theaters.'),
                    ('Acoustic Baffles', 'Hanging panels for sound absorption in large open commercial spaces.'),
                    ('Glass Fiber Reinforced Concrete (GFRC)', 'Lightweight concrete panels for decorative or structural facades.'),
                    ('Tensile Fabric Structures', 'Fabric membranes for canopies or atriums in commercial projects.'),
                    ('Photovoltaic Panels', 'Solar panels for energy generation in sustainable commercial designs.'),
                    ('Demountable Partitions', 'Movable wall systems for flexible office or commercial interiors.'),
                    ('Specialty Glazing (Electrochromic)', 'Smart glass for dynamic light/heat control in commercial buildings.'),
                    ('Anti-Slip Treads', 'Non-slip materials for stairs or high-traffic commercial floors.'),
                    ('Scaffolding', 'Metal or aluminum systems for safe access during construction.'),
                    ('Formwork (Wood', 'Metal) Temporary molds for concrete pouring in slabs walls or columns.'),
                    ('Shoring Systems', 'Temporary supports for structural stability during construction.'),
                    ('Construction Fencing', 'Temporary barriers for site safety and security.'),
                    ('Erosion Control Mats', 'Geotextiles for soil stabilization during site preparation.'),
                    ('Architectural Signage', 'Metal acrylic or illuminated signs for commercial building identification.'),
                    ('Wayfinding Signage', 'Directional signs for navigation in large commercial complexes.'),
                    ('ADA-Compliant Signage', 'Tactile and braille signs for accessibility in commercial buildings.'),
                    ('Paving Stones', 'Concrete or stone pavers for walkways or plazas in commercial sites.'),
                    ('Mulch & Topsoil', 'Materials for landscaping beds or green spaces around commercial buildings.'),
                    ('Irrigation Systems', 'Piping and sprinklers for automated landscaping maintenance.')
                ) AS Subcategories(Subcategory, Note)
                WHERE NOT EXISTS (SELECT 1 FROM ""Subcategory"" WHERE ""Name"" = Subcategory);

                -- STEP 3: Link Categories and Subcategories (many-to-many)
                -- Concrete subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Ready-Mix Concrete', 'Precast Concrete', 'Concrete Blocks (CMU)', 'Rebar', 
                    'Concrete Admixtures', 'Post-Tensioning Systems', 'High-Strength Concrete', 
                    'Polished Concrete Aggregates'
                )
                WHERE c.""Name"" = 'Concrete'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                    WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );

                -- Masonry subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Brick', 'Stone (Natural)', 'Mortar', 'Stucco', 'Glass Block', 'Thin Stone Veneer'
                )
                WHERE c.""Name"" = 'Masonry'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );

                -- Wood & Timber subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Dimensional Lumber', 'Plywood', 'Engineered Wood (LVL)', 'Treated Lumber', 
                    'Hardwood', 'Wood Veneer'
                )
                WHERE c.""Name"" = 'Wood & Timber'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );

                -- Metals subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Structural Steel', 'Rebar (Steel Reinforcement)', 'Metal Studs', 'Sheet Metal', 
                    'Aluminum', 'Curtain Wall Systems', 'Stainless Steel', 'Custom Aluminum Trims'
                )
                WHERE c.""Name"" = 'Metals'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );

                -- Drywall & Finishes subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Drywall (Gypsum Board)', 'Joint Compound', 'Plaster', 'Paint', 
                    'Wallpaper', 'Acoustic Panels', 'Sheetrock Reveals', 'Corner Beads', 
                    'Control Joints', 'Custom Drywall Trims (Aluminum)', 'Level 5 Finish Materials'
                )
                WHERE c.""Name"" = 'Drywall & Finishes'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );

                -- Roofing subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Asphalt Shingles', 'Metal Roofing', 'Membrane Roofing (EPDM)', 
                    'Clay/Concrete Tiles', 'Slate', 'Green Roofing Systems', 'Roof Ballast (Pavers'
                )
                WHERE c.""Name"" = 'Roofing'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );

                -- Insulation subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Fiberglass Batt', 'Spray Foam', 'Rigid Foam (EPS', 
                    'Cellulose', 'Mineral Wool', 'Reflective Insulation'
                )
                WHERE c.""Name"" = 'Insulation'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Windows & Doors subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Vinyl Windows', 'Aluminum Windows', 'Wood Doors', 'Metal Doors', 
                    'Glass (Tempered', 'Automatic Sliding Doors', 'Fire-Rated Doors', 'Blast-Resistant Glazing'
                )
                WHERE c.""Name"" = 'Windows & Doors'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Flooring subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Hardwood Flooring', 'Ceramic/Porcelain Tile', 'Carpet', 'Vinyl (LVT', 
                    'Concrete Flooring', 'Raised Access Flooring', 'Epoxy Flooring', 'Terrazzo'
                )
                WHERE c.""Name"" = 'Flooring'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Plumbing Materials subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'PVC Piping', 'Copper Piping', 'PEX Piping', 'Cast Iron Piping', 
                    'Fittings & Valves', 'Commercial-Grade Fixtures', 'Grease Interceptors'
                )
                WHERE c.""Name"" = 'Plumbing Materials'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Electrical Materials subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Wiring (Romex', 'Conduit (PVC', 'Electrical Boxes', 'Circuit Breakers', 
                    'Lighting Fixtures', 'Emergency Lighting', 'Cable Trays'
                )
                WHERE c.""Name"" = 'Electrical Materials'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- HVAC Materials subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Ductwork', 'Insulation (Duct Wrap)', 'Piping (Refrigerant Lines)', 
                    'Vents & Grilles', 'Chillers', 'VAV Boxes', 'Air Handling Units'
                )
                WHERE c.""Name"" = 'HVAC Materials'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Fasteners & Anchors subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Nails', 'Screws', 'Bolts & Anchors', 'Adhesives & Sealants', 'Chemical Anchors'
                )
                WHERE c.""Name"" = 'Fasteners & Anchors'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Exterior Finishes subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Siding (Vinyl', 'Brick Veneer', 'EIFS (Exterior Insulation Finish)', 
                    'Cladding (Metal', 'ACM Panels (Aluminum Composite)', 'Precast Architectural Panels'
                )
                WHERE c.""Name"" = 'Exterior Finishes'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Fire Protection subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Fire Sprinkler Piping', 'Fireproofing Spray', 'Firestop Sealants', 'Fire-Rated Insulation'
                )
                WHERE c.""Name"" = 'Fire Protection'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Elevators & Escalators subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Elevator Cabs', 'Escalator Components', 'Elevator Control Systems'
                )
                WHERE c.""Name"" = 'Elevators & Escalators'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Acoustic Materials subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Acoustic Ceiling Tiles', 'Soundproofing Membranes', 'Specialty Ceiling Grids', 
                    'Acoustic Wall Panels', 'Acoustic Baffles'
                )
                WHERE c.""Name"" = 'Acoustic Materials'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Specialty Materials subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Glass Fiber Reinforced Concrete (GFRC)', 'Tensile Fabric Structures', 
                    'Photovoltaic Panels', 'Demountable Partitions', 
                    'Specialty Glazing (Electrochromic)', 'Anti-Slip Treads'
                )
                WHERE c.""Name"" = 'Specialty Materials'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Temporary Construction subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Scaffolding', 'Formwork (Wood', 'Shoring Systems', 
                    'Construction Fencing', 'Erosion Control Mats'
                )
                WHERE c.""Name"" = 'Temporary Construction'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Signage & Wayfinding subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Architectural Signage', 'Wayfinding Signage', 'ADA-Compliant Signage'
                )
                WHERE c.""Name"" = 'Signage & Wayfinding'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
                
                -- Landscaping Materials subcategories
                INSERT INTO ""CategorySubcategory"" (""CategoriesId"", ""SubcategoriesId"")
                SELECT c.""Id"", s.""Id""
                FROM ""Category"" c
                JOIN ""Subcategory"" s ON s.""Name"" IN (
                    'Paving Stones', 'Mulch & Topsoil', 'Irrigation Systems'
                )
                WHERE c.""Name"" = 'Landscaping Materials'
                AND NOT EXISTS (
                    SELECT 1 FROM ""CategorySubcategory"" cs 
                     WHERE cs.""CategoriesId"" = c.""Id"" AND cs.""SubcategoriesId"" = s.""Id""
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
