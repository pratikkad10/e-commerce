import CategoryCard from "./CategoryCard"

const Categories = () => {
    const categories = [
        { name: "Men's", image: "/men-sit.jpg", path: "/category/men" },
        { name: "Women's", image: "/women-studio.jpg", path: "/category/women" },
        { name: "Kid's", image: "/kids-studio.jpg", path: "/category/kids" },
    ]
    return (
        <div className="lg:mx-40">
            <h2 className="lg:text-4xl text-foreground/90 text-2xl text-center font-semibold ">Our categories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 lg:gap-8 mt-6 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 bg-background">
                {categories.map((category) => (
                    <CategoryCard
                        key={category.name}
                        image={category.image}
                        path={category.path}
                        sectionName={category.name}
                        description={`Explore the latest trends in ${category.name} fashion.`}
                    />
                ))}
            </div>
        </div>

    )
}

export default Categories