import Banner2 from "@/components/banners/Banner2"
import Categories from "@/components/landing/Categories"
import Wrapper1 from "@/components/landing/Wrapper1"
import Wrapper2 from "@/components/landing/Wrapper2"

export const Landing = () => {
    
    return (
        <div className=" min-h-[100vh] bg-background text-foreground pb-4">
            <Banner2 />
            <Wrapper1 />
            <Wrapper2   />
            <Categories  />
        </div>
    )
}
export default Landing