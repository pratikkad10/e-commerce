import CategoryCard from "./CategoryCard"

const Categories = () => {
    const categories = [
        { name: "Men's", image: "/men-sit.jpg", path: "/category/men" },
        { name: "Women's", image: "/women-studio.jpg", path: "/category/women" },
        { name: "Kid's", image: "/kids-studio.jpg", path: "/category/kids" },
    ]
    return (
        <div className="my-20">
            <h2 className="lg:text-4xl text-muted-foreground text-2xl text-center font-bold ">OUR CATEGORIES</h2>
            <div className="flex flex-col md:flex-row justify-center items-center gap-6 md:gap-10 lg:gap-20 mt-6 px-4 sm:px-6 md:px-12 lg:px-24 xl:px-40 bg-background">
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