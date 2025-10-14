import { Button } from "../ui/button"

const Banner = (props: {
  image: string
  backgroundImage: string
  sectionName: string
  description: string
  onClick: () => void
  flip?: boolean
}) => {
  const flipLayout = props.flip ?? /\bmen\b/i.test(props.sectionName)

  return (
    <section className="h-[100vh] bg-card relative overflow-hidden">
      <img
        src={props.backgroundImage}
        alt="background"
        className="absolute inset-0 w-full h-screen object-cover"
      />
      <div className="absolute inset-0  bg-black/10 z-10"></div>

      <div className="relative z-20 h-full">
        <div className="md:hidden flex flex-col items-center justify-center h-full px-4 sm:px-6 text-center gap-4 sm:gap-6">
          <img
            src={props.image}
            alt="banner"
            className="h-[50%] sm:h-[40%] max-h-[300px] object-contain drop-shadow-2xl"
          />
          <div className="flex flex-col gap-3 sm:gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold dark:text-white/80 drop-shadow-lg">
              {props.sectionName}
            </h1>
            <p className="text-xs sm:text-sm dark:text-white/90 leading-relaxed max-w-xs sm:max-w-md px-2">
              {props.description}
            </p>
            <Button
              onClick={props.onClick}
              className="cursor-pointer px-6 py-3 sm:px-8 sm:py-4 bg-primary text-white text-sm sm:text-base font-semibold rounded-md hover:bg-primary/80 transition-all duration-300 mx-auto"
            >
              Shop Now
            </Button>
          </div>
        </div>

        <div className={`hidden md:flex items-center justify-between h-full px-6 md:px-8 lg:px-16 xl:px-24 ${flipLayout ? 'flex-row-reverse' : ''}`}>
          
          <div className={`flex flex-col justify-center max-w-md lg:max-w-lg xl:max-w-xl gap-4 lg:gap-6 w-full md:w-[50%] ${flipLayout ? "text-right items-end" : "text-left items-start"}`}>
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold dark:text-white/80 drop-shadow-lg">
              {props.sectionName}
            </h1>
            <p className="text-sm md:text-base lg:text-lg dark:text-white/90 leading-relaxed">
              {props.description}
            </p>
            <Button
              onClick={props.onClick}
              className="cursor-pointer px-6 py-3 md:px-8 md:py-4 lg:px-10 lg:py-5 bg-primary  text-zinc-100 text-base md:text-lg lg:text-xl rounded-md hover:bg-primary/80 transition-all duration-300"
            >
              Shop Now
            </Button>
          </div>

          <div className={`flex justify-center items-center w-full md:w-[50%]`}>
            <img
              src={props.image}
              alt="banner"
              className="h-[70%] md:h-[75%] lg:h-[85%] xl:h-[90%] max-w-full object-contain drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default Banner
