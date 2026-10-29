import { ActionHeaderTA } from "@/components/ActionHeaderTA.js";
import { useCanineMotion } from "@/composables/useCanineMotion.js";
import { usePlanFinder } from "@/composables/usePlanFinder.js";
import { usePhotoGallery } from "@/composables/usePhotoGallery.js";
import { useVisitRequest } from "@/composables/useVisitRequest.js";

// ==================== INITIALIZATION ====================
ActionHeaderTA();
useCanineMotion();
usePlanFinder();
usePhotoGallery();
useVisitRequest();
