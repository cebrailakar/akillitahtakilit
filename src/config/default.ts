import ms from "@sencinion/ms/dist/ms";

export const defaultConfig = {
  qrChangeTime: ms("60 saniye"),
  packetPassword: "777777",
  automation: true,
  qr_openTime: ms("1 dakika"),
  yasaklı_uygulamalar: [""],
  school_name: "Güzelyurt Anadolu İmam Hatip Lisesi",
  class_number: "10/A",
  announcements: [
    {
      title: "",
      description: "",
      imageURL: "",
    },
    {
      title: "Boş veri",
      description: "Burayı doldurunuz",
      imageURL: "",
    },
  ],
  ders_saatleri: [
    {
      type: "starting",
      start: "00:00",
      end: "08:20",
      actions: ["lock"],
    },
    {
      //1. ders
      type: "ders",
      start: "08:20",
      end: "09:00",
      actions: ["unlock"],
    },
    {
      type: "tenefus",
      start: "09:00",
      end: "09:10",
      actions: ["lock"],
    },
    {
      //2. ders
      type: "ders",
      start: "09:10",
      end: "09:50",
      actions: ["unlock"],
    },
    {
      type: "tenefus",
      start: "09:50",
      end: "10:00",
      actions: ["lock"],
    },
    {
      //3. ders
      type: "ders",
      start: "10:00",
      end: "10:40",
      actions: ["unlock"],
    },
    {
      type: "tenefus",
      start: "10:40",
      end: "10:50",
      actions: ["lock"],
    },
    {
      //4. ders
      type: "ders",
      start: "10:50",
      end: "11:30",
      actions: ["unlock"],
    },
    {
      type: "tenefus",
      start: "11:30",
      end: "10:40",
      actions: ["lock"],
    },
    {
      //5. ders
      type: "ders",
      start: "11:40",
      end: "12:20",
      actions: ["unlock"],
    },
    {
      type: "oglen",
      start: "12:20",
      end: "13:10",
      actions: ["lock", "close_screen"],
    },
    {
      //6. ders
      type: "ders",
      start: "13:10",
      end: "13:50",
      actions: ["unlock", "open_screen"],
    },
    {
      type: "tenefus",
      start: "13:50",
      end: "14:00",
      actions: ["lock"],
    },
    {
      //7. ders
      type: "ders",
      start: "14:00",
      end: "14:40",
      actions: ["unlock"],
    },
    {
      type: "tenefus",
      start: "14:40",
      end: "14:50",
      actions: ["lock"],
    },
    {
      //8. ders
      type: "ders",
      start: "14:50",
      end: "15:30",
      actions: ["unlock"],
    },
    {
      type: "finish",
      start: "15:30",
      end: "23:59",
      actions: ["lock", "shutdown"],
    },
  ],
  //not for now
  url: "",
};
export const globalConfig = {
  systemPassword: "159357",
};
