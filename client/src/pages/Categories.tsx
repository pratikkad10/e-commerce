import { useNavigate } from "react-router-dom"
import Banner from "@/components/categories/Banner"

const Categories = () => {
    const navigate = useNavigate()

    return (
        <div className="">
            <div>
                <Banner
                    image="/women5.png"
                    backgroundImage="/banner-bg1.jpg"
                    sectionName="Women's Collection"
                    description="Embrace elegance and confidence with our latest arrivals — where fashion meets comfort in every detail."
                    onClick={() => navigate('/category/women')}
                />

                <Banner
                    image="/male2.png"
                    backgroundImage="/banner-bg3.jpg"
                    sectionName="Men's Collection"
                    description="Redefine your style with our bold and timeless essentials — crafted for comfort, confidence, and everyday sophistication."
                    onClick={() => navigate('/category/men')}
                    flip={true}
                />

                <Banner
                    image="/kids2.png"
                    backgroundImage="/banner-bg1.jpg"
                    sectionName="Kids' Collection"
                    description="Bright colors, comfy fits, and endless fun — explore the collection that keeps up with every adventure."
                    onClick={() => navigate('/category/kids')}
                />
                <Banner
                    image="/Electronic.png"
                    backgroundImage="/banner-bg3.jpg"
                    sectionName="Electronics"
                    description="Discover cutting-edge gadgets and smart devices — designed to make your life easier, faster, and smarter."
                    onClick={() => navigate('/category/electronics')}
                    flip={true}
                />

                <Banner
                    image="/home-appliances.png"
                    backgroundImage="/banner-bg1.jpg"
                    sectionName="Home & Kitchen"
                    description="Upgrade your living space with stylish home and kitchen essentials."
                    flip={false}
                    onClick={() => navigate('/category/home-kitchen')}


                />
                <Banner
                    image="/beauty.png"
                    backgroundImage="/banner-bg3.jpg"
                    sectionName="Beauty"
                    description="Discover top beauty products and skincare essentials."
                    flip={true}
                    onClick={() => navigate('/category/beauty')}

                />
                <Banner
                    image="/sports.png"
                    backgroundImage="/banner-bg1.jpg"
                    sectionName="Sports"
                    description="Gear up with the latest sports equipment and apparel."
                    flip={false}
                    onClick={() => navigate('/category/sports')}

                />
                <Banner
                    image="/shoes.png"
                    backgroundImage="/banner-bg3.jpg"
                    sectionName="Footwear"
                    description="Step into style with the latest collection of shoes and sneakers."
                    flip={true}
                    onClick={() => navigate('/category/footwear')}
                />
                <Banner
                    image="/stationary.png"
                    backgroundImage="/banner-bg1.jpg"
                    sectionName="Books & Stationery"
                    description="Find your next favorite read and essential stationery supplies."
                    flip={false} 
                    onClick={() => navigate('/category/books-stationery')}
                />

            </div>


        </div>
    )
}

export default Categories