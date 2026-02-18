import { motion } from "framer-motion";
import { MapPin, Instagram, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-noir-elevated border-t border-border">
      <div className="px-6 py-10">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8"
        >
          <h3 className="font-display text-2xl tracking-[0.4em] text-gradient-gold">
            DXB
          </h3>
          <p className="font-body text-xs tracking-[0.3em] text-muted-foreground mt-1">
            BRANDS
          </p>
        </motion.div>

        <div className="divider-gold mx-auto w-20 mb-8" />

        {/* Store Info */}
        <div className="space-y-5 max-w-sm mx-auto">
          {/* Location */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-4 justify-center"
          >
            <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="font-body text-sm text-foreground">Dubai</p>
          </motion.div>

          {/* WhatsApp */}
          <motion.a
            href="https://wa.me/97144447777"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 justify-center group"
          >
            <MessageCircle className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="font-body text-sm text-foreground group-hover:text-primary transition-colors">
              WhatsApp
            </p>
          </motion.a>

          {/* Instagram */}
          <motion.a
            href="https://instagram.com/dxbbrands"
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-4 justify-center group"
          >
            <Instagram className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="font-body text-sm text-foreground group-hover:text-primary transition-colors">
              @dxbbrands
            </p>
          </motion.a>
        </div>

        {/* Copyright */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-8 pt-6 border-t border-border/50"
        >
          <p className="font-body text-xs text-muted-foreground">
            © 2024 DXB Brands. All rights reserved.
          </p>
          <p className="font-elegant text-xs italic text-muted-foreground/60 mt-2">
            Luxury Fashion Catalog
          </p>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;
