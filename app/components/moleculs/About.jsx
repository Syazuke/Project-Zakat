import Zakat from "@/app/assets/images/zakat.jpg";
import Image from "next/image";
import zakatconfig from "@/app/libs/zakat";

const About = () => {
  return (
    <div id="about" className="flex flex-col px-4">
      <div className="p-3 rounded-full self-center bg-emerald-100 w-fit">
        <p>
          <i className="fa-solid fa-book"></i> Tentang Zakat
        </p>
      </div>
      <div className="flex flex-col items-center pt-6">
        <h1 className="text-3xl font-bold">Memahami Zakat</h1>
        <p className="text-center text-sm mt-4">
          Salah satu dari rukun Islam, Zakat mensucikan harta dan membantu
          mereka yang membutuhkan
        </p>
      </div>
      <div className="flex justify-center items-center w-full md:w-1/2 relative mt-10 mx-auto">
        <div className="absolute inset-0 bg-emerald-200 rounded-2xl w-full h-80 shadow-inner -rotate-3 z-0"></div>
        <div className="relative z-10 w-full h-80 overflow-hidden rounded-2xl shadow-lg">
          <Image
            src={Zakat}
            alt="Gambar Zakat"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
      </div>
      <div className="flex flex-col gap-6 pt-10">
        <h1 className="text-3xl font-bold">Apa itu Zakat?</h1>
        <p className="opacity-70">
          Zakat adalah kewajiban sedekah dalam Islam, mengharuskan umat Muslim
          untuk memberikan 2,5% dari harta mereka yang memenuhi syarat kepada
          yang membutuhkan. Zakat adalah salah satu dari Rukun Islam dan
          berfungsi untuk mensucikan harta seseorang dan mendistribusikan
          kembali sumber daya untuk mendukung kaum yang kurang beruntung.
        </p>
        {zakatconfig.map((item) => {
          return (
            <div key={item.id} className="flex gap-4">
              <div className="bg-emerald-100 px-5 py-3 h-fit flex justify-center items-center rounded-md">
                <p className="font-bold">{item.number}</p>
              </div>
              <div className="flx flex-col">
                <h1 className="font-semibold mb-1 text-xl">{item.title}</h1>
                <p className="text-sm opacity-70">{item.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default About;
