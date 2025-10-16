import { useNavigate } from "react-router-dom"
import { Button } from "../ui/button"

const Banner2 = () => {

    const navigate = useNavigate();
    return (
        <div className="lg:h-[80vh] mt-16 lg:mt-0 py-4 bg-[#f3f2f3] dark:bg-background overflow-hidden flex items-center justify-center">
            <div className="flex items-center gap-4 md:gap-8 lg:gap-38">
                <div className="hidden sm:block -ml-10 sm:-ml-20 lg:-ml-30 flex-shrink-0">
                    <img className="h-[50vh] sm:h-[60vh] lg:h-[80vh] object-contain" loading="lazy" src="/women-studio.png" alt="Fashion Model" />
                </div>

                <div className="flex flex-col gap-4 md:gap-6 lg:gap-8 px-4 sm:px-0">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-bold tracking-widest [writing-mode:vertical-lr] rotate-180">FASHION</p>
                        <p className="text-xs text-muted-foreground">Discover the latest trends in modern fashion</p>
                        <p className="text-xs text-muted-foreground font-semibold">COLLECTION 2025</p>
                    </div>
                    
                    <div className="flex flex-col ">
                        <h1 className="text-5xl lg:text-7xl font-bold text-foreground/90">REIMAGINE</h1>
                        <h1 className="text-5xl lg:text-7xl font-bold text-foreground/90">EVERYDAY</h1>
                    </div>

                    <div>
                        <Button 
                        onClick={()=>navigate('/shop')}
                        size="lg" className="px-8">
                            Shop Now
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Banner2