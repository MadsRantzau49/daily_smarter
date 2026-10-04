export const validLesson = {
  title: "How DMA Moves Data Without Keeping the CPU Busy",
  topic_key: "direct_memory_access",
  difficulty: "beginner" as const,
  estimated_reading_minutes: 7,
  introduction:
    "Today you will learn why devices do not always need the CPU to copy every byte.",
  concept:
    "Direct memory access is a hardware mechanism that lets a device controller transfer blocks of data directly between a device and main memory.",
  how_it_works:
    "The CPU configures a DMA-capable controller with source, destination, and size information. The controller then coordinates the transfer and signals completion.",
  why_it_matters:
    "Without DMA, the CPU would spend many instructions moving bytes instead of doing useful application work. DMA improves throughput and frees processing time.",
  concrete_example:
    "When an SSD reads a file, its controller can place a block into RAM using DMA and interrupt the CPU only after the block has arrived.",
  key_terms: [
    {
      term: "DMA",
      definition: "A mechanism for hardware-directed memory transfers.",
    },
    {
      term: "Device controller",
      definition: "Hardware that operates and communicates with a peripheral.",
    },
    {
      term: "Interrupt",
      definition: "A signal that asks the CPU to handle an event.",
    },
  ],
  quiz: {
    question:
      "Why is DMA useful when a device transfers a large block of data?",
    options: [
      "It raises the clock speed",
      "It avoids CPU copying every byte",
      "It replaces RAM",
      "It disables interrupts",
    ],
    correct_option: 1,
    explanation:
      "The controller performs the transfer, allowing the CPU to work on something else until completion.",
  },
  prerequisite_topics: ["memory", "cpu"],
  related_topics: ["interrupts", "device_controllers"],
};
