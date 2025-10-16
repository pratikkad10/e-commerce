import { useNavigate } from 'react-router-dom'
import { ArrowUpRight, Grid2X2Plus, PlusIcon } from 'lucide-react'

const Top_left = () => {
  const navigate = useNavigate()

  return (
    <div className="section-top-left w-sm lg:w-1/3 lg:p-4" >
                    <div className="left-top mt-30" >
                        <h1 className="capitalize text-foreground/90 font-bold text-5xl lg:text-7xl tracking-wider">
                            SLAY THE
                            <br />
                            DAY IN 
                        </h1>
                        <h1 className="lg:text-6xl text-2xl 
                        text-muted-foreground flex italic" >
                            STYLE
                            <span className="">
                                <ArrowUpRight className="lg:h-16 h-8 w-10 lg:w-16" />
                            </span>
                        </h1>
                        <div className="underline h-1 w-[78%] bg-primary/80 rounded-full"></div>
                    </div>
                    <div className="left-bottom h-29 mt-4  lg:w-[78%] rounded-md bg-card-foreground text-muted px-4 py-6" >
                        <div className="flex items-center gap-2 ">
                            <Grid2X2Plus className="h-6 w-6" />
                            <h1 className="font-semibold text-xl ">OUR PRODUCTS</h1>
                        </div>

                        <div className="flex justify-between items-center gap-2 mt-4 pl-8">
                            <span className="font-semibold flex items-center">1,20,000<PlusIcon className="h-4 w-4" /></span>
                            <span onClick={() => navigate('/shop')} className="capitalize cursor-pointer italic underline hover:text-primary transition-colors">EXPLORE<ArrowUpRight className="inline h-6 w-6" /></span>
                        </div>
                    </div>
                </div>
  )
}

export default Top_left